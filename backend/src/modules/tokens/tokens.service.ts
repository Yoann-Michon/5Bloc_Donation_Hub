import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class TokensService {
    constructor(
        private prisma: PrismaService,
        private blockchainService: BlockchainService,
        private ipfsService: IpfsService,
        private cacheService: CacheService,
    ) { }

    async getUserTokens(address: string) {
        if (!this.blockchainService.isAddress(address)) {
            throw new Error('Invalid Ethereum address');
        }

        const cacheKey = `user:${address.toLowerCase()}:tokens`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const tokens = await this.prisma.token.findMany({
            where: {
                owner: address.toLowerCase(),
                isBurned: false,
            },
            orderBy: { mintedAt: 'desc' },
        });

        const formattedTokens = await Promise.all(
            tokens.map(async (token) => {
                let metadata = null;
                if (token.metadataURI) {
                    try {
                        metadata = await this.ipfsService.getMetadata(token.metadataURI);
                    } catch (error) {
                        console.error(`Failed to fetch metadata for token ${token.tokenId}:`, error);
                    }
                }

                return {
                    tokenId: token.tokenId,
                    level: this.getLevelName(token.level),
                    levelNumber: token.level,
                    donationAmount: token.donationAmount,
                    donationAmountFormatted: this.blockchainService.formatEther(token.donationAmount),
                    metadataURI: token.metadataURI,
                    metadata,
                    mintedAt: token.mintedAt,
                    lastTransferAt: token.lastTransferAt,
                };
            }),
        );

        const result = {
            address,
            tokenCount: tokens.length,
            tokens: formattedTokens,
        };

        await this.cacheService.set(cacheKey, result, 300);
        return result;
    }

    async getToken(tokenId: number) {
        const cacheKey = `token:${tokenId}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const token = await this.prisma.token.findUnique({
            where: { tokenId },
            include: {
                ownerUser: {
                    select: {
                        address: true,
                        tokenCount: true,
                    },
                },
            },
        });

        if (!token) {
            return null;
        }

        let metadata = null;
        if (token.metadataURI) {
            try {
                metadata = await this.ipfsService.getMetadata(token.metadataURI);
            } catch (error) {
                console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
            }
        }

        const result = {
            tokenId: token.tokenId,
            owner: token.owner,
            level: this.getLevelName(token.level),
            levelNumber: token.level,
            donationAmount: token.donationAmount,
            donationAmountFormatted: this.blockchainService.formatEther(token.donationAmount),
            metadataURI: token.metadataURI,
            metadata,
            mintedAt: token.mintedAt,
            lastTransferAt: token.lastTransferAt,
            isBurned: token.isBurned,
        };

        await this.cacheService.set(cacheKey, result, 300);
        return result;
    }

    async getTokenHistory(tokenId: number) {
        const transfers = await this.prisma.tokenTransfer.findMany({
            where: { tokenId },
            orderBy: { timestamp: 'desc' },
        });

        return {
            tokenId,
            transfers: transfers.map((t) => ({
                from: t.from,
                to: t.to,
                transactionHash: t.transactionHash,
                timestamp: t.timestamp,
            })),
        };
    }

    private getLevelName(level: number): string {
        const levels = ['DONOR', 'SPONSOR', 'PATRON', 'BENEFACTOR'];
        return levels[level] || 'UNKNOWN';
    }
}
