import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BadgeTier } from '@prisma/client';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || 'http://blockchain:8545'
    );

    const contractAddress = process.env.CONTRACT_ADDRESS || '';
    const contractABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function getTokensByOwner(address owner) view returns (uint256[])',
      'function tokenURI(uint256 tokenId) view returns (string)',
    ];

    this.contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.provider
    );
  }

  async getBadgeCount(walletAddress: string): Promise<number> {
    try {
      const balance = await this.contract.balanceOf(walletAddress);
      return Number(balance);
    } catch (error) {
      return 0;
    }
  }

  async getUserBadges(walletAddress: string): Promise<Array<{ tokenId: number; metadataUri: string; tier: BadgeTier }>> {
    try {
      const tokenIds = await this.contract.getTokensByOwner(walletAddress);
      const badges = [];

      for (const tokenId of tokenIds) {
        const metadataUri = await this.contract.tokenURI(Number(tokenId));
        const tier = this.determineTier(Number(tokenId));

        badges.push({
          tokenId: Number(tokenId),
          metadataUri,
          tier,
        });
      }

      return badges;
    } catch (error) {
      return [];
    }
  }

  private determineTier(tokenId: number): BadgeTier {
    if (tokenId >= 1000) return BadgeTier.LEGENDARY;
    if (tokenId >= 500) return BadgeTier.GOLD;
    if (tokenId >= 100) return BadgeTier.SILVER;
    return BadgeTier.BRONZE;
  }

  async getHighestTier(walletAddress: string): Promise<BadgeTier | null> {
    const badges = await this.getUserBadges(walletAddress);

    if (badges.length === 0) return null;

    const tierOrder = [BadgeTier.LEGENDARY, BadgeTier.GOLD, BadgeTier.SILVER, BadgeTier.BRONZE];

    for (const tier of tierOrder) {
      if (badges.some(b => b.tier === tier)) {
        return tier;
      }
    }

    return BadgeTier.BRONZE;
  }
}
