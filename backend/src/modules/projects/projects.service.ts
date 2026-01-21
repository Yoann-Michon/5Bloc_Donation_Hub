import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private cacheService: CacheService,
        private blockchainService: BlockchainService,
    ) { }

    async findAll(page: number, limit: number, status: string, category?: string) {
        const cacheKey = `projects:page:${page}:limit:${limit}:status:${status}:category:${category || 'all'}`;

        // Try cache first
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const skip = (page - 1) * limit;
        const where: any = {};

        if (status === 'active') {
            where.isActive = true;
        } else if (status === 'closed') {
            where.isActive = false;
        }

        // Note: category filtering will be added when metadata is parsed from IPFS
        // For now, we'll return all projects matching the status filter

        const [projects, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    creatorUser: {
                        select: {
                            address: true,
                            tokenCount: true,
                        },
                    },
                    _count: {
                        select: {
                            donations: true,
                        },
                    },
                },
            }),
            this.prisma.project.count({ where }),
        ]);

        const formattedProjects = projects.map((project) => ({
            id: project.id,
            onChainId: project.onChainId,
            creator: project.creator,
            metadataURI: project.metadataURI,
            fundingGoal: project.fundingGoal,
            totalRaised: project.totalRaised,
            progress: this.calculateProgress(project.totalRaised, project.fundingGoal),
            deadline: project.deadline,
            isActive: project.isActive,
            donorsCount: project._count.donations,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        }));

        const result = {
            data: formattedProjects,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };

        // Cache for 5 minutes
        await this.cacheService.set(cacheKey, result, 300);

        return result;
    }

    async findOne(id: number) {
        const cacheKey = `project:${id}`;

        // Try cache first
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                creatorUser: {
                    select: {
                        address: true,
                        tokenCount: true,
                        totalDonated: true,
                    },
                },
                donations: {
                    take: 10,
                    orderBy: { timestamp: 'desc' },
                    include: {
                        donorUser: {
                            select: {
                                address: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        donations: true,
                    },
                },
            },
        });

        if (!project) {
            return null;
        }

        const result = {
            id: project.id,
            onChainId: project.onChainId,
            creator: project.creator,
            metadataURI: project.metadataURI,
            fundingGoal: project.fundingGoal,
            totalRaised: project.totalRaised,
            progress: this.calculateProgress(project.totalRaised, project.fundingGoal),
            deadline: project.deadline,
            isActive: project.isActive,
            donorsCount: project._count.donations,
            recentDonations: project.donations.map((d) => ({
                donor: d.donor,
                amount: d.amount,
                amountFormatted: this.blockchainService.formatEther(d.amount),
                badgeLevel: d.badgeLevel,
                timestamp: d.timestamp,
                transactionHash: d.transactionHash,
            })),
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };

        // Cache for 5 minutes
        await this.cacheService.set(cacheKey, result, 300);

        return result;
    }

    private calculateProgress(raised: string, goal: string): number {
        const raisedBigInt = BigInt(raised);
        const goalBigInt = BigInt(goal);

        if (goalBigInt === BigInt(0)) {
            return 0;
        }

        return Number((raisedBigInt * BigInt(100)) / goalBigInt);
    }
}
