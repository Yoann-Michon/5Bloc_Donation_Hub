

export let CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
export let BLOCKCHAIN_RPC_URL = import.meta.env.VITE_BLOCKCHAIN_RPC_URL || 'http://localhost:8545';

let configLoaded = false;
let configPromise: Promise<void> | null = null;

export async function loadContractConfig(): Promise<void> {
    if (configLoaded) return;

    if (configPromise) return configPromise;

    configPromise = (async () => {
        try {
            const config = await import('./config');

            if (config.CONTRACT_ADDRESS && config.CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
                CONTRACT_ADDRESS = config.CONTRACT_ADDRESS;
                console.log('✅ Loaded CONTRACT_ADDRESS from config.ts:', CONTRACT_ADDRESS);
            }

            if (config.BLOCKCHAIN_RPC_URL) {
                BLOCKCHAIN_RPC_URL = config.BLOCKCHAIN_RPC_URL;
            }

            configLoaded = true;
        } catch (error) {
            console.log('⚠️ Using CONTRACT_ADDRESS from .env:', CONTRACT_ADDRESS);
            configLoaded = true;
        }
    })();

    return configPromise;
}

export function getContractAddress(): string {
    return CONTRACT_ADDRESS;
}

export function getBlockchainRpcUrl(): string {
    return BLOCKCHAIN_RPC_URL;
}

export function isConfigLoaded(): boolean {
    return configLoaded;
}
