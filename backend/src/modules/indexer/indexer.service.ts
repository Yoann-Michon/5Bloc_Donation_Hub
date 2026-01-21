import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class IndexerService implements OnModuleInit {
    private readonly logger = new Logger(IndexerService.name);
    private isListening = false;

    constructor(
        private blockchainService: BlockchainService,
        private prisma: PrismaService,
        private cacheService: CacheService,
    ) { }

    async onModuleInit() {
        // Start listening to blockchain events
        await this.startListening();
    }

    private async startListening() {
        const contract = this.blockchainService.getContract();

        if (!contract) {
            this.logger.warn('Contract not initialized. Indexer disabled.');
            return;
        }

        if (this.isListening) {
            this.logger.warn('Indexer already listening');
            return;
        }

        this.isListening = true;
        this.logger.log('🎧 Starting blockchain event indexer...');

        // Listen to DonationMade events
        contract.on('DonationMade', async (projectId, donor, amount, badgeLevel, event) => {
            await this.handleDonationEvent({
                projectId: projectId.toString(),
                donor,
                amount: amount.toString(),
                badgeLevel: Number(badgeLevel),
                transactionHash: event.log.transactionHash,
                blockNumber: event.log.blockNumber,
            });
        });

        // Listen to TokenMinted events
        contract.on('TokenMinted', async (owner, tokenId, level, metadataURI, event) => {
            await this.handleTokenMintedEvent({
                owner,
                tokenId: tokenId.toString(),
                level: Number(level),
                metadataURI,
                transactionHash: event.log.transactionHash,
            });
        });

        // Listen to TokenConverted events
        contract.on('TokenConverted', async (owner, burnedTokenIds, newTokenId, newLevel, event) => {
            await this.handleTokenConvertedEvent({
                owner,
                burnedTokenIds: burnedTokenIds.map((id: any) => Number(id)),
                newTokenId: Number(newTokenId),
                newLevel: Number(newLevel),
                transactionHash: event.log.transactionHash,
            });
        });

        // Listen to ProjectCreated events
        contract.on('ProjectCreated', async (projectId, creator, fundingGoal, event) => {
            await this.handleProjectCreatedEvent({
                projectId: Number(projectId),
                creator,
                fundingGoal: fundingGoal.toString(),
                transactionHash: event.log.transactionHash,
            });
        });

        this.logger.log('✅ Indexer listening to blockchain events');
    }

    private async handleDonationEvent(data: any) {
        try {
            this.logger.log(`📥 New donation: ${data.amount} Wei to project ${data.projectId}`);

            // Create or update user
            await this.prisma.user.upsert({
                where: { address: data.donor.toLowerCase() },
                create: {
                    address: data.donor.toLowerCase(),
                    tokenCount: 0,
                    totalDonated: data.amount,
                    lastTransactionAt: new Date(),
                },
                update: {
                    totalDonated: {
                        increment: data.amount,
                    },
                    lastTransactionAt: new Date(),
                },
            });

            // Create donation record
            await this.prisma.donation.create({
                data: {
                    projectId: parseInt(data.projectId),
                    donor: data.donor.toLowerCase(),
                    amount: data.amount,
                    badgeLevel: data.badgeLevel,
                    transactionHash: data.transactionHash,
                    blockNumber: data.blockNumber,
                    timestamp: new Date(),
                },
            });

            // Update project total raised
            await this.prisma.project.update({
                where: { onChainId: parseInt(data.projectId) },
                data: {
                    totalRaised: {
                        increment: data.amount,
                    },
                },
            });

            // Invalidate caches
            await this.cacheService.del(`project:${data.projectId}`);
            await this.cacheService.del(`user:${data.donor.toLowerCase()}:profile`);
            await this.cacheService.del('global:stats');

            this.logger.log(`✅ Donation indexed: ${data.transactionHash}`);
        } catch (error) {
            this.logger.error(`Failed to index donation: ${error.message}`, error.stack);
        }
    }

    private async handleTokenMintedEvent(data: any) {
        try {
            this.logger.log(`🎖️  New token minted: #${data.tokenId} for ${data.owner}`);

            // Create token record
            await this.prisma.token.create({
                data: {
                    tokenId: parseInt(data.tokenId),
                    owner: data.owner.toLowerCase(),
                    level: data.level,
                    donationAmount: '0', // Will be updated from donation event
                    metadataURI: data.metadataURI,
                    mintedAt: new Date(),
                    lastTransferAt: new Date(),
                },
            });

            // Update user token count
            await this.prisma.user.update({
                where: { address: data.owner.toLowerCase() },
                data: {
                    tokenCount: {
                        increment: 1,
                    },
                },
            });

            // Invalidate caches
            await this.cacheService.del(`user:${data.owner.toLowerCase()}:tokens`);
            await this.cacheService.del(`user:${data.owner.toLowerCase()}:profile`);

            this.logger.log(`✅ Token indexed: #${data.tokenId}`);
        } catch (error) {
            this.logger.error(`Failed to index token: ${error.message}`, error.stack);
        }
    }

    private async handleTokenConvertedEvent(data: any) {
        try {
            this.logger.log(`🔄 Token conversion: ${data.burnedTokenIds.join(', ')} → ${data.newTokenId}`);

            // Mark old tokens as burned
            await this.prisma.token.updateMany({
                where: {
                    tokenId: {
                        in: data.burnedTokenIds,
                    },
                },
                data: {
                    isBurned: true,
                },
            });

            // Create conversion record
            await this.prisma.tokenConversion.create({
                data: {
                    owner: data.owner.toLowerCase(),
                    burnedTokenIds: data.burnedTokenIds,
                    newTokenId: data.newTokenId,
                    fromLevel: data.burnedTokenIds.length > 0 ? 0 : 0, // Will be determined from burned tokens
                    toLevel: data.newLevel,
                    transactionHash: data.transactionHash,
                    timestamp: new Date(),
                },
            });

            // Update user lock time
            await this.prisma.user.update({
                where: { address: data.owner.toLowerCase() },
                data: {
                    lockEndTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes lock
                    lastTransactionAt: new Date(),
                },
            });

            // Invalidate caches
            await this.cacheService.del(`user:${data.owner.toLowerCase()}:tokens`);
            await this.cacheService.del(`user:${data.owner.toLowerCase()}:profile`);

            this.logger.log(`✅ Conversion indexed: ${data.transactionHash}`);
        } catch (error) {
            this.logger.error(`Failed to index conversion: ${error.message}`, error.stack);
        }
    }

    private async handleProjectCreatedEvent(data: any) {
        try {
            this.logger.log(`📋 New project created: #${data.projectId}`);

            // Create project record
            await this.prisma.project.create({
                data: {
                    onChainId: data.projectId,
                    creator: data.creator.toLowerCase(),
                    metadataURI: '', // Will be set from contract
                    fundingGoal: data.fundingGoal,
                    totalRaised: '0',
                    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days default
                    isActive: true,
                },
            });

            // Invalidate global stats cache
            await this.cacheService.del('global:stats');

            this.logger.log(`✅ Project indexed: #${data.projectId}`);
        } catch (error) {
            this.logger.error(`Failed to index project: ${error.message}`, error.stack);
        }
    }
}
