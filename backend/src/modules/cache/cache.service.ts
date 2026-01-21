import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async get<T>(key: string): Promise<T | null> {
        try {
            return await this.cacheManager.get<T>(key);
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    async set(key: string, value: any, ttl: number = 300): Promise<void> {
        try {
            await this.cacheManager.set(key, value, ttl * 1000); // Convert to milliseconds
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.cacheManager.del(key);
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
        }
    }

    async reset(): Promise<void> {
        try {
            await this.cacheManager.reset();
        } catch (error) {
            console.error('Cache reset error:', error);
        }
    }
}
