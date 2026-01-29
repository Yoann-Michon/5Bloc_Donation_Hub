import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BadgeTier } from '@prisma/client';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || 'http://blockchain:8545'
    );

    this.contractAddress = process.env.CONTRACT_ADDRESS || '';
  }

  private getContract(): ethers.Contract | null {
    if (!this.contractAddress) {
      return null;
    }

    if (!this.contract) {
      const contractABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function getTokensByOwner(address owner) view returns (uint256[])',
        'function tokenURI(uint256 tokenId) view returns (string)',
      ];

      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI,
        this.provider
      );
    }

    return this.contract;
  }

  async getBadgeCount(walletAddress: string): Promise<number> {
    try {
      const contract = this.getContract();
      if (!contract) return 0;

      const balance = await contract.balanceOf(walletAddress);
      return Number(balance);
    } catch (error) {
      return 0;
    }
  }

  async getUserBadges(walletAddress: string): Promise<Array<{ tokenId: number; metadataUri: string; tier: BadgeTier }>> {
    try {
      const contract = this.getContract();
      if (!contract) return [];

      const tokenIds = await contract.getTokensByOwner(walletAddress);
      const badges = [];

      for (const tokenId of tokenIds) {
        const metadataUri = await contract.tokenURI(Number(tokenId));
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
