import { Module } from '@nestjs/common';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { BlockchainService } from './blockchain.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BadgesController],
  providers: [BadgesService, BlockchainService],
  exports: [BadgesService, BlockchainService],
})
export class BadgesModule {}
