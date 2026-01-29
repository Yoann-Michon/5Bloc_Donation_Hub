/**
 * Web3 Utility Functions
 * Provides formatting, validation, and conversion utilities for Web3 data
 */

import { ethers } from 'ethers';

/**
 * Format Ethereum address to shortened version
 * @param address - Full Ethereum address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Formatted address like "0x1234...5678"
 */
export const formatAddress = (address: string | null | undefined, chars: number = 4): string => {
    if (!address) return '';
    if (!ethers.isAddress(address)) return address;

    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * Format token balance with proper decimals
 * @param balance - Balance in Wei or smallest unit
 * @param decimals - Token decimals (default: 18 for ETH)
 * @param displayDecimals - Number of decimals to display (default: 4)
 * @returns Formatted balance string
 */
export const formatBalance = (
    balance: string | number | bigint,
    decimals: number = 18,
    displayDecimals: number = 4
): string => {
    try {
        const balanceStr = balance.toString();
        let formatted = balanceStr;

        // If it doesn't have a decimal point, assume it's in Wei and needs formatting
        if (!balanceStr.includes('.')) {
            formatted = ethers.formatUnits(balanceStr, decimals);
        }

        const num = parseFloat(formatted);

        if (num === 0) return '0';
        if (num < 0.0001) return '< 0.0001';

        return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
    } catch (error) {
        return '0';
    }
};

/**
 * Format token amount with commas for thousands
 * @param amount - Amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted amount with commas
 */
export const formatTokenAmount = (amount: string | number, decimals: number = 2): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) return '0';

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    }).format(num);
};

/**
 * Format USD value with $ symbol and commas
 * @param value - USD value
 * @returns Formatted USD string like "$1,234.56"
 */
export const formatUSD = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '$0.00';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

/**
 * Format transaction hash for display
 * @param hash - Transaction hash
 * @param chars - Number of characters to show on each side (default: 6)
 * @returns Formatted hash like "0x123456...abcdef"
 */
export const formatTxHash = (hash: string | null | undefined, chars: number = 6): string => {
    if (!hash) return '';
    return `${hash.substring(0, chars + 2)}...${hash.substring(hash.length - chars)}`;
};

/**
 * Validate Ethereum address
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
    try {
        return ethers.isAddress(address);
    } catch {
        return false;
    }
};

/**
 * Convert Wei to Gwei (for gas prices)
 * @param wei - Amount in Wei
 * @returns Amount in Gwei
 */
export const weiToGwei = (wei: string | number | bigint): string => {
    try {
        return ethers.formatUnits(wei.toString(), 'gwei');
    } catch (error) {
        return '0';
    }
};

/**
 * Convert ETH to Wei
 * @param eth - Amount in ETH
 * @returns Amount in Wei as string
 */
export const ethToWei = (eth: string | number): string => {
    try {
        return ethers.parseEther(eth.toString()).toString();
    } catch (error) {
        return '0';
    }
};

/**
 * Get block explorer URL for a transaction
 * @param chainId - Network chain ID
 * @param txHash - Transaction hash
 * @returns Block explorer URL
 */
export const getExplorerUrl = (chainId: number, txHash: string): string => {
    const explorers: Record<number, string> = {
        1: 'https://etherscan.io/tx/',
        5: 'https://goerli.etherscan.io/tx/',
        11155111: 'https://sepolia.etherscan.io/tx/',
        137: 'https://polygonscan.com/tx/',
        80001: 'https://mumbai.polygonscan.com/tx/',
        42161: 'https://arbiscan.io/tx/',
        10: 'https://optimistic.etherscan.io/tx/',
        8453: 'https://basescan.org/tx/',
    };

    const baseUrl = explorers[chainId] || explorers[1];
    return `${baseUrl}${txHash}`;
};

/**
 * Get block explorer URL for an address
 * @param chainId - Network chain ID
 * @param address - Ethereum address
 * @returns Block explorer URL
 */
export const getAddressExplorerUrl = (chainId: number, address: string): string => {
    const explorers: Record<number, string> = {
        1: 'https://etherscan.io/address/',
        5: 'https://goerli.etherscan.io/address/',
        11155111: 'https://sepolia.etherscan.io/address/',
        137: 'https://polygonscan.com/address/',
        80001: 'https://mumbai.polygonscan.com/address/',
        42161: 'https://arbiscan.io/address/',
        10: 'https://optimistic.etherscan.io/address/',
        8453: 'https://basescan.org/address/',
    };

    const baseUrl = explorers[chainId] || explorers[1];
    return `${baseUrl}${address}`;
};

/**
 * Calculate estimated transaction time based on gas price
 * @param gasPrice - Gas price in Gwei
 * @returns Estimated time string like "~30 seconds"
 */
export const estimateTransactionTime = (gasPrice: number): string => {
    if (gasPrice < 20) return '~5 minutes';
    if (gasPrice < 50) return '~2 minutes';
    if (gasPrice < 100) return '~1 minute';
    return '~30 seconds';
};

/**
 * Copy text to clipboard with fallback
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();

            try {
                document.execCommand('copy');
                return true;
            } catch (error) {
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    } catch (error) {
        return false;
    }
};

/**
 * Format time ago from timestamp
 * @param timestamp - Unix timestamp in seconds
 * @returns Human readable time ago string
 */
export const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return new Date(timestamp * 1000).toLocaleDateString();
};

/**
 * Debounce function for limiting rapid calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
