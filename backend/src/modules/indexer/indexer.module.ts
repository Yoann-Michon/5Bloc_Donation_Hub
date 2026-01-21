import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [BlockchainModule, CacheModule],
    providers: [IndexerService],
    exports: [IndexerService],
})
export class IndexerModule { }
