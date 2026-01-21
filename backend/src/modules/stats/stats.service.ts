import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class StatsService {
    constructor(
        private prisma: PrismaService,
        private blockchainService: BlockchainService,
        private cacheService: CacheService,
    ) { }

    async getGlobalStats() {
        const cacheKey = 'global:stats';
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const [
            totalProjects,
            activeProjects,
            totalDonors,
            totalTokens,
            tokenDistribution,
            donations,
        ] = await Promise.all([
            this.prisma.project.count(),
            this.prisma.project.count({ where: { isActive: true } }),
            this.prisma.user.count(),
            this.prisma.token.count({ where: { isBurned: false } }),
            this.prisma.token.groupBy({
                by: ['level'],
                where: { isBurned: false },
                _count: true,
            }),
            this.prisma.donation.aggregate({
                _sum: { amount: true },
                _count: true,
            }),
        ]);

        const totalDonations = donations._sum.amount || '0';
        const donationCount = donations._count;

        // Calculate average donation
        const avgDonation = donationCount > 0
            ? (BigInt(totalDonations) / BigInt(donationCount)).toString()
            : '0';

        // Format token distribution
        const distribution = {
            DONOR: 0,
            SPONSOR: 0,
            PATRON: 0,
            BENEFACTOR: 0,
        };

        tokenDistribution.forEach((item) => {
            const levelName = this.getLevelName(item.level);
            distribution[levelName] = item._count;
        });

        const result = {
            totalProjects,
            activeProjects,
            totalDonations,
            totalDonationsFormatted: this.blockchainService.formatEther(totalDonations),
            totalDonors,
            totalTokens,
            tokenDistribution: distribution,
            averageDonation: this.blockchainService.formatEther(avgDonation),
            updatedAt: new Date(),
        };

        await this.cacheService.set(cacheKey, result, 300); // Cache for 5 minutes
        return result;
    }

    async getProjectStats(projectId: number) {
        const cacheKey = `project:${projectId}:stats`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                donations: {
                    orderBy: { amount: 'desc' },
                    take: 1,
                    include: {
                        donorUser: {
                            select: { address: true },
                        },
                    },
                },
                _count: {
                    select: { donations: true },
                },
            },
        });

        if (!project) {
            return null;
        }

        const donations = await this.prisma.donation.findMany({
            where: { projectId },
            select: { amount: true, timestamp: true },
        });

        const totalDonations = project._count.donations;
        const totalRaised = project.totalRaised;

        const avgDonation = totalDonations > 0
            ? (BigInt(totalRaised) / BigInt(totalDonations)).toString()
            : '0';

        const topDonor = project.donations[0] || null;

        // Group donations by date for timeline
        const timeline = this.groupDonationsByDate(donations);

        const result = {
            projectId,
            totalDonations,
            totalRaised,
            totalRaisedFormatted: this.blockchainService.formatEther(totalRaised),
            averageDonation: this.blockchainService.formatEther(avgDonation),
            topDonor: topDonor
                ? {
                    address: topDonor.donorUser.address,
                    amount: topDonor.amount,
                    amountFormatted: this.blockchainService.formatEther(topDonor.amount),
                }
                : null,
            donationTimeline: timeline,
        };

        await this.cacheService.set(cacheKey, result, 300);
        return result;
    }

    async getLeaderboard(limit: number) {
        const cacheKey = `leaderboard:${limit}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const users = await this.prisma.user.findMany({
            orderBy: { totalDonated: 'desc' },
            take: limit,
            include: {
                tokens: {
                    where: { isBurned: false },
                    select: { level: true },
                },
                _count: {
                    select: { donations: true },
                },
            },
        });

        const leaderboard = users.map((user, index) => {
            const highestBadge = user.tokens.length > 0
                ? this.getLevelName(Math.max(...user.tokens.map((t) => t.level)))
                : null;

            return {
                rank: index + 1,
                address: user.address,
                totalDonated: user.totalDonated,
                totalDonatedFormatted: this.blockchainService.formatEther(user.totalDonated),
                donationsCount: user._count.donations,
                highestBadge,
            };
        });

        const result = { leaderboard };

        await this.cacheService.set(cacheKey, result, 600); // Cache for 10 minutes
        return result;
    }

    private getLevelName(level: number): string {
        const levels = ['DONOR', 'SPONSOR', 'PATRON', 'BENEFACTOR'];
        return levels[level] || 'UNKNOWN';
    }

    private groupDonationsByDate(donations: any[]): any[] {
        const grouped = new Map<string, { amount: bigint; count: number }>();

        donations.forEach((d) => {
            const date = d.timestamp.toISOString().split('T')[0];
            const existing = grouped.get(date) || { amount: BigInt(0), count: 0 };
            grouped.set(date, {
                amount: existing.amount + BigInt(d.amount),
                count: existing.count + 1,
            });
        });

        return Array.from(grouped.entries())
            .map(([date, data]) => ({
                date,
                amount: this.blockchainService.formatEther(data.amount.toString()),
                count: data.count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
}
