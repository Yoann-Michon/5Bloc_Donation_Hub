import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DonationsModule } from './modules/donations/donations.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';
import { IpfsModule } from './modules/ipfs/ipfs.module';
import { IndexerModule } from './modules/indexer/indexer.module';
import { CacheModule } from './modules/cache/cache.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Rate limiting
        ThrottlerModule.forRoot([
            {
                ttl: 60000, // 60 seconds
                limit: 100, // 100 requests per minute
            },
        ]),

        // Core modules
        PrismaModule,
        CacheModule,
        BlockchainModule,
        IpfsModule,
        IndexerModule,

        // API modules
        ProjectsModule,
        DonationsModule,
        TokensModule,
        UsersModule,
        StatsModule,
    ],
})
export class AppModule { }
