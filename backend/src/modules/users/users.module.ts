import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [BlockchainModule, CacheModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
