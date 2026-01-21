import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private blockchainService: BlockchainService,
        private cacheService: CacheService,
    ) { }

    async getUserProfile(address: string) {
        if (!this.blockchainService.isAddress(address)) {
            throw new Error('Invalid Ethereum address');
        }

        const cacheKey = `user:${address.toLowerCase()}:profile`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const user = await this.prisma.user.findUnique({
            where: { address: address.toLowerCase() },
            include: {
                tokens: {
                    where: { isBurned: false },
                    select: { level: true },
                },
                donations: {
                    select: { projectId: true },
                },
            },
        });

        if (!user) {
            // Return default profile for new users
            return {
                address,
                tokenCount: 0,
                totalDonated: '0',
                totalDonatedFormatted: '0 ETH',
                highestLevel: null,
                badges: {
                    DONOR: 0,
                    SPONSOR: 0,
                    PATRON: 0,
                    BENEFACTOR: 0,
                },
                projectsSupported: 0,
                lastDonation: null,
                memberSince: null,
                isInCooldown: false,
                isLocked: false,
                cooldownEndsAt: null,
                lockEndsAt: null,
            };
        }

        // Calculate badge distribution
        const badges = {
            DONOR: 0,
            SPONSOR: 0,
            PATRON: 0,
            BENEFACTOR: 0,
        };

        user.tokens.forEach((token) => {
            const levelName = this.getLevelName(token.level);
            badges[levelName]++;
        });

        // Get highest level
        const highestLevel = user.tokens.length > 0
            ? this.getLevelName(Math.max(...user.tokens.map((t) => t.level)))
            : null;

        // Get unique projects supported
        const uniqueProjects = new Set(user.donations.map((d) => d.projectId));

        // Check cooldown and lock status
        const now = new Date();
        const isInCooldown = user.lastTransactionAt
            ? now < new Date(user.lastTransactionAt.getTime() + 5 * 60 * 1000)
            : false;
        const isLocked = user.lockEndTime ? now < user.lockEndTime : false;

        const result = {
            address: user.address,
            tokenCount: user.tokenCount,
            totalDonated: user.totalDonated,
            totalDonatedFormatted: this.blockchainService.formatEther(user.totalDonated),
            highestLevel,
            badges,
            projectsSupported: uniqueProjects.size,
            lastDonation: user.lastTransactionAt,
            memberSince: user.createdAt,
            isInCooldown,
            isLocked,
            cooldownEndsAt: isInCooldown && user.lastTransactionAt
                ? new Date(user.lastTransactionAt.getTime() + 5 * 60 * 1000)
                : null,
            lockEndsAt: isLocked ? user.lockEndTime : null,
        };

        await this.cacheService.set(cacheKey, result, 60); // Cache for 1 minute
        return result;
    }

    async getUserDonations(address: string) {
        if (!this.blockchainService.isAddress(address)) {
            throw new Error('Invalid Ethereum address');
        }

        const donations = await this.prisma.donation.findMany({
            where: { donor: address.toLowerCase() },
            orderBy: { timestamp: 'desc' },
            include: {
                project: {
                    select: {
                        id: true,
                        onChainId: true,
                        metadataURI: true,
                    },
                },
            },
        });

        return donations.map((d) => ({
            id: d.id,
            projectId: d.projectId,
            amount: d.amount,
            amountFormatted: this.blockchainService.formatEther(d.amount),
            badgeLevel: this.getLevelName(d.badgeLevel),
            transactionHash: d.transactionHash,
            timestamp: d.timestamp,
        }));
    }

    async getUserActivity(address: string) {
        if (!this.blockchainService.isAddress(address)) {
            throw new Error('Invalid Ethereum address');
        }

        const [donations, conversions, transfers] = await Promise.all([
            this.prisma.donation.findMany({
                where: { donor: address.toLowerCase() },
                orderBy: { timestamp: 'desc' },
                take: 20,
            }),
            this.prisma.tokenConversion.findMany({
                where: { owner: address.toLowerCase() },
                orderBy: { timestamp: 'desc' },
                take: 20,
            }),
            this.prisma.tokenTransfer.findMany({
                where: {
                    OR: [
                        { from: address.toLowerCase() },
                        { to: address.toLowerCase() },
                    ],
                },
                orderBy: { timestamp: 'desc' },
                take: 20,
            }),
        ]);

        const activity = [
            ...donations.map((d) => ({
                type: 'donation',
                timestamp: d.timestamp,
                data: {
                    projectId: d.projectId,
                    amount: this.blockchainService.formatEther(d.amount),
                    badgeLevel: this.getLevelName(d.badgeLevel),
                    transactionHash: d.transactionHash,
                },
            })),
            ...conversions.map((c) => ({
                type: 'conversion',
                timestamp: c.timestamp,
                data: {
                    fromLevel: this.getLevelName(c.fromLevel),
                    toLevel: this.getLevelName(c.toLevel),
                    burnedTokenIds: c.burnedTokenIds,
                    newTokenId: c.newTokenId,
                    transactionHash: c.transactionHash,
                },
            })),
            ...transfers.map((t) => ({
                type: 'transfer',
                timestamp: t.timestamp,
                data: {
                    tokenId: t.tokenId,
                    from: t.from,
                    to: t.to,
                    transactionHash: t.transactionHash,
                },
            })),
        ];

        // Sort by timestamp descending
        activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return activity.slice(0, 50);
    }

    private getLevelName(level: number): string {
        const levels = ['DONOR', 'SPONSOR', 'PATRON', 'BENEFACTOR'];
        return levels[level] || 'UNKNOWN';
    }
}
