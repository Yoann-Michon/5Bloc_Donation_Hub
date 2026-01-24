/**
 * Enhanced Wallet Hook
 * Extends existing useWallet with additional Web3 features
 */

import { useState, useCallback, useEffect } from 'react';
import { getChainConfig, isChainSupported } from '../utils/chainConfig';
import { BrowserProvider, Contract, type InterfaceAbi, formatEther, type Signer } from 'ethers';

export interface WalletState {
    account: string | null;
    chainId: number | null;
    isConnecting: boolean;
    isConnected: boolean;
    error: string | null;
    balance: string | null;
    ensName: string | null;
    avatar: string | null;
    signer: Signer | null;
    isInitialized: boolean;
}

export type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase';

// DEV MODE: Set to false to use real wallet connection
const DEV_MODE = false;

// Mock wallet data for development
const MOCK_WALLET = {
    account: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    chainId: 31337, // Hardhat Local
    balance: '0x15af1d78b58c40000', // 1.5 ETH in hex
};

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // TO BE FILLED WITH DEPLOYED CONTRACT ADDRESS E.G. "0x..."

const DONATION_BADGE_ABI = [
  "function donate(uint256 projectId, string memory tokenURI) external payable",
  "function balanceOf(address owner) view returns (uint256)",
  "function lastActionTimestamp(address user) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export const useWallet = () => {
    const [state, setState] = useState<WalletState>({
        account: DEV_MODE ? MOCK_WALLET.account : null,
        chainId: DEV_MODE ? MOCK_WALLET.chainId : null,
        isConnecting: false,
        isConnected: DEV_MODE,
        error: null,
        balance: DEV_MODE ? MOCK_WALLET.balance : null,
        ensName: null,
        avatar: null,
        signer: null,
        isInitialized: DEV_MODE, // Dev mode is instantly initialized
    });

    /**
     * Initialize wallet and listen to events
     */
    useEffect(() => {
        // Skip MetaMask initialization in DEV_MODE
        if (DEV_MODE) {
            console.log('🔧 DEV MODE: Using mock wallet connection');
            return;
        }

        const init = async () => {
            if (typeof window.ethereum === 'undefined') {
                setState(prev => ({ ...prev, isInitialized: true }));
                return;
            }

            try {
                const provider = new BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();

                if (accounts.length > 0) {
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    const network = await provider.getNetwork();
                    const balance = await provider.getBalance(address);

                    setState(prev => ({
                        ...prev,
                        account: address,
                        isConnected: true,
                        chainId: Number(network.chainId),
                        balance: formatEther(balance),
                        signer: signer,
                    }));
                } else {
                     // Check chainId even if not connected
                    const network = await provider.getNetwork();
                    setState(prev => ({ ...prev, chainId: Number(network.chainId) }));
                }

            } catch (err) {
                console.error('Error checking wallet connection:', err);
            } finally {
                setState(prev => ({ ...prev, isInitialized: true }));
            }
        };

        void init();

        if (window.ethereum?.on) {
            const handleAccountsChanged = async (args: unknown) => {
                const accounts = args as string[];
                if (accounts.length === 0) {
                    setState(prev => ({
                        ...prev,
                        account: null,
                        isConnected: false,
                        balance: null,
                        ensName: null,
                        avatar: null,
                        signer: null,
                    }));
                } else {
                    // Re-initialize to get full state
                    const provider = new BrowserProvider(window.ethereum!);
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    const balance = await provider.getBalance(address);
                    
                    setState(prev => ({
                        ...prev,
                        account: address,
                        isConnected: true,
                        balance: formatEther(balance),
                        signer: signer,
                    }));
                }
            };

            const handleChainChanged = (args: unknown) => {
                const chainIdHex = args as string;
                const chainId = parseInt(chainIdHex, 16);
                setState(prev => ({ ...prev, chainId }));
                // It's recommended to reload the page on chain change, 
                // but for SPA state update might be enough if handled correctly.
                // refreshBalance(); 
            };

            const handleDisconnect = () => {
                setState(prev => ({
                    ...prev,
                    account: null,
                    chainId: null,
                    isConnecting: false,
                    isConnected: false,
                    error: null,
                    balance: null,
                    ensName: null,
                    avatar: null,
                    signer: null,
                }));
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('disconnect', handleDisconnect);

            return () => {
                if (window.ethereum?.removeListener) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                    window.ethereum.removeListener('disconnect', handleDisconnect);
                }
            };
        }
    }, []);

    /**
     * Connect wallet with provider selection
     */
    const connect = async () => {
        // In DEV_MODE, wallet is already connected
        if (DEV_MODE) {
            console.log('🔧 DEV MODE: Wallet already connected');
            return;
        }

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        if (typeof window.ethereum === 'undefined') {
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: 'MetaMask is not installed. Please install MetaMask to continue.',
            }));
            return;
        }

        try {
            const provider = new BrowserProvider(window.ethereum);
            // Request account access
            await provider.send("eth_requestAccounts", []);
            
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            const balance = await provider.getBalance(address);

            setState(prev => ({
                ...prev,
                account: address,
                chainId: Number(network.chainId),
                balance: formatEther(balance),
                isConnected: true,
                isConnecting: false,
                error: null,
                signer: signer,
            }));

        } catch (err: unknown) {
            const error = err as { message?: string; code?: number };
            let errorMessage = 'Failed to connect wallet';

            if (error.code === 4001) {
                errorMessage = 'Connection request rejected';
            } else if (error.code === -32002) {
                errorMessage = 'Connection request already pending';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: errorMessage,
            }));
        }
    };

    /**
     * Disconnect wallet
     */
    const disconnect = useCallback(() => {
        // In DEV_MODE, reset to mock wallet state
        if (DEV_MODE) {
            console.log('🔧 DEV MODE: Disconnect simulated (wallet remains connected)');
            return;
        }

        setState(prev => ({
            ...prev,
            account: null,
            chainId: null,
            isConnecting: false,
            isConnected: false,
            error: null,
            balance: null,
            ensName: null,
            avatar: null,
            signer: null,
        }));
    }, []);

    /**
     * Switch to a different network
     */
    const switchNetwork = async (targetChainId: number) => {
        if (!window.ethereum) {
            setState(prev => ({
                ...prev,
                error: 'Wallet not available'
            }));
            return false;
        }

        const chainConfig = getChainConfig(targetChainId);
        if (!chainConfig) {
            setState(prev => ({
                ...prev,
                error: 'Unsupported network'
            }));
            return false;
        }

        try {
            // Try to switch to the network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainConfig.chainIdHex }],
            });

            setState(prev => ({ ...prev, chainId: targetChainId, error: null }));
            return true;

        } catch (switchError: unknown) {
            const error = switchError as { code?: number };

            // This error code indicates that the chain has not been added to MetaMask
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: chainConfig.chainIdHex,
                            chainName: chainConfig.displayName,
                            nativeCurrency: chainConfig.nativeCurrency,
                            rpcUrls: chainConfig.rpcUrls,
                            blockExplorerUrls: chainConfig.blockExplorerUrls,
                        }],
                    });

                    setState(prev => ({ ...prev, chainId: targetChainId, error: null }));
                    return true;

                } catch (addError) {
                    console.error('Error adding network:', addError);
                    setState(prev => ({
                        ...prev,
                        error: 'Failed to add network'
                    }));
                    return false;
                }
            }

            console.error('Error switching network:', switchError);
            setState(prev => ({
                ...prev,
                error: 'Failed to switch network'
            }));
            return false;
        }
    };

    /**
     * Check if current network is supported
     */
    const isCurrentChainSupported = useCallback(() => {
        return state.chainId ? isChainSupported(state.chainId) : false;
    }, [state.chainId]);

    /**
     * Get current chain config
     */
    const getCurrentChainConfig = useCallback(() => {
        return state.chainId ? getChainConfig(state.chainId) : null;
    }, [state.chainId]);

    /**
     * Refresh balance
     */
    const refreshBalance = useCallback(async () => {
        if (!state.account || !window.ethereum) return;

        try {
             const provider = new BrowserProvider(window.ethereum);
             const balance = await provider.getBalance(state.account);

            setState(prev => ({ ...prev, balance: formatEther(balance) }));
        } catch (error) {
            console.error('Error refreshing balance:', error);
        }
    }, [state.account]);

    /**
     * Get contract instance connected with signer
     */
    const getContract = useCallback((address: string, abi: InterfaceAbi) => {
        if (!state.signer) return null;
        try {
            return new Contract(address, abi, state.signer);
        } catch (error) {
            console.error("Failed to create contract instance", error);
            return null;
        }
    }, [state.signer]);

    /**
     * Get donation badge contract instance
     */
    const getBadgeContract = useCallback(() => {
        if (!state.signer || !CONTRACT_ADDRESS) return null;
        try {
            return new Contract(CONTRACT_ADDRESS, DONATION_BADGE_ABI, state.signer);
        } catch (error) {
            console.error("Failed to create badge contract instance", error);
            return null;
        }
    }, [state.signer]);

    return {
        ...state,
        connect,
        disconnect,
        switchNetwork,
        isCurrentChainSupported,
        getCurrentChainConfig,
        refreshBalance,
        getContract,
        getBadgeContract,
    };
};
