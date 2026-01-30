import * as fs from 'fs';
import * as path from 'path';

/**
 * Contract Configuration Loader
 * Loads contract address from shared volume before NestJS initialization
 */

export interface ContractConfig {
    contractAddress: string;
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
        blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://blockchain:8545',
    };

    // Try to load from shared volume (Docker)
    const sharedConfigPath = '/app/shared/contract-config.json';

    try {
        if (fs.existsSync(sharedConfigPath)) {
            const fileContent = fs.readFileSync(sharedConfigPath, 'utf-8');
            const jsonConfig = JSON.parse(fileContent);

            if (jsonConfig.contractAddress && jsonConfig.contractAddress !== '0x0000000000000000000000000000000000000000') {
                config.contractAddress = jsonConfig.contractAddress;
                console.log('✅ Loaded CONTRACT_ADDRESS from shared volume:', config.contractAddress);
            }
        } else {
            console.log('⚠️ Shared config not found, using environment variable:', config.contractAddress);
        }
    } catch (error) {
        console.warn('⚠️ Failed to load contract config from shared volume:', error.message);
        console.log('   Using environment variable:', config.contractAddress);
    }

    cachedConfig = config;
    return config;
}

/**
 * Get contract address (must call loadContractConfig first)
 */
export function getContractAddress(): string {
    if (!cachedConfig) {
        throw new Error('Contract config not loaded. Call loadContractConfig() first.');
    }
    return cachedConfig.contractAddress;
}

/**
 * Get blockchain RPC URL (must call loadContractConfig first)
 */
export function getBlockchainRpcUrl(): string {
    if (!cachedConfig) {
        throw new Error('Contract config not loaded. Call loadContractConfig() first.');
    }
    return cachedConfig.blockchainRpcUrl;
}

/**
 * Check if config is loaded
 */
export function isConfigLoaded(): boolean {
    return cachedConfig !== null;
}
