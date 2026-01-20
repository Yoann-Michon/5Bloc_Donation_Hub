

import { ethers } from 'ethers';

export const formatAddress = (address: string | null | undefined, chars: number = 4): string => {
    if (!address) return '';
    if (!ethers.isAddress(address)) return address;

    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

export const formatBalance = (
    balance: string | number | bigint,
    decimals: number = 18,
    displayDecimals: number = 4
): string => {
    try {
        const balanceStr = balance.toString();
        const formatted = ethers.formatUnits(balanceStr, decimals);
        const num = parseFloat(formatted);

        if (num === 0) return '0';
        if (num < 0.0001) return '< 0.0001';

        return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
    } catch (error) {
        console.error('Error formatting balance:', error);
        return '0';
    }
};

export const formatTokenAmount = (amount: string | number, decimals: number = 2): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) return '0';

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    }).format(num);
};

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

export const formatTxHash = (hash: string | null | undefined, chars: number = 6): string => {
    if (!hash) return '';
    return `${hash.substring(0, chars + 2)}...${hash.substring(hash.length - chars)}`;
};

export const isValidAddress = (address: string): boolean => {
    try {
        return ethers.isAddress(address);
    } catch {
        return false;
    }
};

export const weiToGwei = (wei: string | number | bigint): string => {
    try {
        return ethers.formatUnits(wei.toString(), 'gwei');
    } catch (error) {
        console.error('Error converting Wei to Gwei:', error);
        return '0';
    }
};

export const ethToWei = (eth: string | number): string => {
    try {
        return ethers.parseEther(eth.toString()).toString();
    } catch (error) {
        console.error('Error converting ETH to Wei:', error);
        return '0';
    }
};

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

export const estimateTransactionTime = (gasPrice: number): string => {
    if (gasPrice < 20) return '~5 minutes';
    if (gasPrice < 50) return '~2 minutes';
    if (gasPrice < 100) return '~1 minute';
    return '~30 seconds';
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {

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
                console.error('Fallback: Could not copy text: ', error);
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    } catch (error) {
        console.error('Could not copy text: ', error);
        return false;
    }
};

export const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return new Date(timestamp * 1000).toLocaleDateString();
};

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
