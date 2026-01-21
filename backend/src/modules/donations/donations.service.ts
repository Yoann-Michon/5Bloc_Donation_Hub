import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class DonationsService {
    constructor(
        private prisma: PrismaService,
        private blockchainService: BlockchainService,
    ) { }

    async findAll(projectId?: number, donor?: string, limit: number = 50) {
        const where: any = {};

        if (projectId) {
            where.projectId = projectId;
        }

        if (donor) {
            where.donor = donor.toLowerCase();
        }

        const donations = await this.prisma.donation.findMany({
            where,
            take: limit,
            orderBy: { timestamp: 'desc' },
            include: {
                project: {
                    select: {
                        id: true,
                        onChainId: true,
                        metadataURI: true,
                    },
                },
                donorUser: {
                    select: {
                        address: true,
                        tokenCount: true,
                    },
                },
            },
        });

        return {
            data: donations.map((d) => ({
                id: d.id,
                projectId: d.projectId,
                donor: d.donor,
                amount: d.amount,
                amountFormatted: this.blockchainService.formatEther(d.amount),
                badgeLevel: this.getBadgeLevelName(d.badgeLevel),
                transactionHash: d.transactionHash,
                blockNumber: d.blockNumber,
                timestamp: d.timestamp,
            })),
            meta: {
                total: donations.length,
                limit,
            },
        };
    }

    async findRecent(limit: number = 10) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const donations = await this.prisma.donation.findMany({
            where: {
                timestamp: {
                    gte: oneDayAgo,
                },
            },
            take: limit,
            orderBy: { timestamp: 'desc' },
            include: {
                project: {
                    select: {
                        id: true,
                        metadataURI: true,
                    },
                },
            },
        });

        return donations.map((d) => ({
            id: d.id,
            projectId: d.projectId,
            donor: d.donor,
            amount: d.amount,
            amountFormatted: this.blockchainService.formatEther(d.amount),
            badgeLevel: this.getBadgeLevelName(d.badgeLevel),
            transactionHash: d.transactionHash,
            timestamp: d.timestamp,
        }));
    }

    async findByHash(hash: string) {
        const donation = await this.prisma.donation.findUnique({
            where: { transactionHash: hash },
            include: {
                project: {
                    select: {
                        id: true,
                        onChainId: true,
                        metadataURI: true,
                    },
                },
                donorUser: {
                    select: {
                        address: true,
                        tokenCount: true,
                        totalDonated: true,
                    },
                },
            },
        });

        if (!donation) {
            return null;
        }

        return {
            id: donation.id,
            projectId: donation.projectId,
            donor: donation.donor,
            amount: donation.amount,
            amountFormatted: this.blockchainService.formatEther(donation.amount),
            badgeLevel: this.getBadgeLevelName(donation.badgeLevel),
            transactionHash: donation.transactionHash,
            blockNumber: donation.blockNumber,
            timestamp: donation.timestamp,
            project: donation.project,
            donorUser: donation.donorUser,
        };
    }

    private getBadgeLevelName(level: number): string {
        const levels = ['DONOR', 'SPONSOR', 'PATRON', 'BENEFACTOR'];
        return levels[level] || 'UNKNOWN';
    }
}
