import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from './blockchain.service';
import { BadgeTier } from '@prisma/client';

@Injectable()
export class BadgesService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async syncUserBadges(walletAddress: string) {
    const badges = await this.blockchainService.getUserBadges(walletAddress);

    for (const badge of badges) {
      await this.prisma.userBadge.upsert({
        where: {
          walletAddress_tokenId: {
            walletAddress,
            tokenId: badge.tokenId,
          },
        },
        update: {
          lastSyncAt: new Date(),
          metadataUri: badge.metadataUri,
          tier: badge.tier,
        },
        create: {
          walletAddress,
          tokenId: badge.tokenId,
          tier: badge.tier,
          metadataUri: badge.metadataUri,
        },
      });
    }

    const dbBadges = await this.prisma.userBadge.findMany({
      where: { walletAddress },
    });

    const blockchainTokenIds = new Set(badges.map(b => b.tokenId));
    const badgesToDelete = dbBadges.filter(
      b => !blockchainTokenIds.has(b.tokenId)
    );

    for (const badge of badgesToDelete) {
      await this.prisma.userBadge.delete({
        where: { id: badge.id },
      });
    }

    return this.getUserBadges(walletAddress);
  }

  async getUserBadges(walletAddress: string) {
    return this.prisma.userBadge.findMany({
      where: { walletAddress },
      orderBy: { acquiredAt: 'desc' },
    });
  }

  async getHighestTier(walletAddress: string): Promise<BadgeTier | null> {
    const badges = await this.prisma.userBadge.findMany({
      where: { walletAddress },
      orderBy: { tier: 'desc' },
      take: 1,
    });

    if (badges.length === 0) {
      return this.blockchainService.getHighestTier(walletAddress);
    }

    const tierOrder = {
      [BadgeTier.LEGENDARY]: 4,
      [BadgeTier.GOLD]: 3,
      [BadgeTier.SILVER]: 2,
      [BadgeTier.BRONZE]: 1,
    };

    const sortedBadges = await this.prisma.userBadge.findMany({
      where: { walletAddress },
    });

    if (sortedBadges.length === 0) return null;

    return sortedBadges.reduce((highest, current) =>
      tierOrder[current.tier] > tierOrder[highest.tier] ? current : highest
    ).tier;
  }

  async hasPrivilege(walletAddress: string, privilegeType: string): Promise<boolean> {
    const highestTier = await this.getHighestTier(walletAddress);

    if (!highestTier) return false;

    const privilege = await this.prisma.privilege.findUnique({
      where: { type: privilegeType as any },
    });

    if (!privilege) return false;

    const tierOrder = {
      [BadgeTier.LEGENDARY]: 4,
      [BadgeTier.GOLD]: 3,
      [BadgeTier.SILVER]: 2,
      [BadgeTier.BRONZE]: 1,
    };

    return tierOrder[highestTier] >= tierOrder[privilege.requiredTier];
  }
}
