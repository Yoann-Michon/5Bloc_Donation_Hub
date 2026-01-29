import { Controller, Get, Post, Param } from '@nestjs/common';
import { BadgesService } from './badges.service';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get(':walletAddress')
  async getUserBadges(@Param('walletAddress') walletAddress: string) {
    return this.badgesService.getUserBadges(walletAddress);
  }

  @Post(':walletAddress/sync')
  async syncBadges(@Param('walletAddress') walletAddress: string) {
    return this.badgesService.syncUserBadges(walletAddress);
  }

  @Get(':walletAddress/tier')
  async getHighestTier(@Param('walletAddress') walletAddress: string) {
    const tier = await this.badgesService.getHighestTier(walletAddress);
    return { tier };
  }
}
