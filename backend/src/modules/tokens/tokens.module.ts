import { Module } from '@nestjs/common';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [BlockchainModule, IpfsModule, CacheModule],
    controllers: [TokensController],
    providers: [TokensService],
    exports: [TokensService],
})
export class TokensModule { }
