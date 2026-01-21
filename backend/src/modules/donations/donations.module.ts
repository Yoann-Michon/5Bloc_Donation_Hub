import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
    imports: [BlockchainModule],
    controllers: [DonationsController],
    providers: [DonationsService],
    exports: [DonationsService],
})
export class DonationsModule { }
