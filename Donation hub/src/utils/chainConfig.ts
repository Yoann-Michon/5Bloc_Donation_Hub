/**
 * Chain Configuration
 * Network definitions and utilities for multi-chain support
 */

export interface ChainConfig {
    chainId: number;
    chainIdHex: string;
    name: string;
    displayName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
    iconUrl?: string;
    color: string;
    isTestnet: boolean;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
    1: {
        chainId: 1,
        chainIdHex: '0x1',
        name: 'ethereum',
        displayName: 'Ethereum',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://eth.llamarpc.com'],
        blockExplorerUrls: ['https://etherscan.io'],
        color: '#627EEA',
        isTestnet: false,
    },
    11155111: {
        chainId: 11155111,
        chainIdHex: '0xaa36a7',
        name: 'sepolia',
        displayName: 'Sepolia',
        nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://rpc.sepolia.org'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
        color: '#627EEA',
        isTestnet: true,
    },
    137: {
        chainId: 137,
        chainIdHex: '0x89',
        name: 'polygon',
        displayName: 'Polygon',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
        color: '#8247E5',
        isTestnet: false,
    },
    42161: {
        chainId: 42161,
        chainIdHex: '0xa4b1',
        name: 'arbitrum',
        displayName: 'Arbitrum One',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io'],
        color: '#28A0F0',
        isTestnet: false,
    },
    10: {
        chainId: 10,
        chainIdHex: '0xa',
        name: 'optimism',
        displayName: 'Optimism',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io'],
        color: '#FF0420',
        isTestnet: false,
    },
    8453: {
        chainId: 8453,
        chainIdHex: '0x2105',
        name: 'base',
        displayName: 'Base',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
        color: '#0052FF',
        isTestnet: false,
    },
};

/**
 * Get chain configuration by chain ID
 */
export const getChainConfig = (chainId: number | string): ChainConfig | null => {
    const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
    return SUPPORTED_CHAINS[id] || null;
};

/**
 * Get chain display name
 */
export const getChainName = (chainId: number | string): string => {
    const config = getChainConfig(chainId);
    return config?.displayName || 'Unknown Network';
};

/**
 * Check if chain is supported
 */
export const isChainSupported = (chainId: number | string): boolean => {
    const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
    return id in SUPPORTED_CHAINS;
};

/**
 * Get testnet chains
 */
export const getTestnetChains = (): ChainConfig[] => {
    return Object.values(SUPPORTED_CHAINS).filter(chain => chain.isTestnet);
};

/**
 * Get mainnet chains
 */
export const getMainnetChains = (): ChainConfig[] => {
    return Object.values(SUPPORTED_CHAINS).filter(chain => !chain.isTestnet);
};

/**
 * Convert chain ID to hex format
 */
export const chainIdToHex = (chainId: number): string => {
    return `0x${chainId.toString(16)}`;
};

/**
 * Convert hex chain ID to number
 */
export const hexToChainId = (hex: string): number => {
    return parseInt(hex, 16);
};
