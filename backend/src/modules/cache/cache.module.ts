import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
    imports: [
        NestCacheModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_URL');

                if (!redisUrl) {
                    console.warn('⚠️  REDIS_URL not configured. Using in-memory cache.');
                    return {
                        ttl: 300, // 5 minutes default
                    };
                }

                return {
                    store: redisStore,
                    url: redisUrl,
                    ttl: 300,
                };
            },
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule { }
