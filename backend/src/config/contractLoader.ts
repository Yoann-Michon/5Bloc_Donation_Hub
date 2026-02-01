import * as fs from 'fs';
import * as path from 'path';

/**
 * Contract Configuration Loader
 * Loads contract address from shared volume before NestJS initialization
 */

export interface ContractConfig {
    contractAddress: string;
    marketplaceAddress: string;
    blockchainRpcUrl: string;
}

let cachedConfig: ContractConfig | null = null;

/**
 * Load contract configuration from shared volume or environment
 */
export async function loadContractConfig(): Promise<ContractConfig> {
    if (cachedConfig) {
        return cachedConfig;
    }

    const config: ContractConfig = {
        contractAddress: process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
        marketplaceAddress: process.env.MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000',
        blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://blockchain:8545',
    };

    // Try to load from shared volume (Docker)
    const sharedConfigPath = '/app/shared/contract-config.json';

    try {
        if (fs.existsSync(sharedConfigPath)) {
            const fileContent = fs.readFileSync(sharedConfigPath, 'utf-8');
            const jsonConfig = JSON.parse(fileContent);

            if (jsonConfig.contractAddress) {
                config.contractAddress = jsonConfig.contractAddress;
            }
            if (jsonConfig.marketplaceAddress) {
                config.marketplaceAddress = jsonConfig.marketplaceAddress;
            }
            console.log('✅ Loaded contract configuration from shared volume');
        } else {
            console.log('⚠️ Shared config not found, using environment variables');
        }
    } catch (error) {
        console.warn('⚠️ Failed to load contract config from shared volume:', error.message);
    }

    cachedConfig = config;
    return config;
}

/**
 * Get contract address
 */
export function getContractAddress(): string {
    return cachedConfig?.contractAddress || '0x0000000000000000000000000000000000000000';
}

/**
 * Get marketplace address
 */
export function getMarketplaceAddress(): string {
    return cachedConfig?.marketplaceAddress || '0x0000000000000000000000000000000000000000';
}

/**
 * Get blockchain RPC URL
 */
export function getBlockchainRpcUrl(): string {
    return cachedConfig?.blockchainRpcUrl || 'http://blockchain:8545';
}

/**
 * Check if config is loaded
 */
export function isConfigLoaded(): boolean {
    return cachedConfig !== null;
}
