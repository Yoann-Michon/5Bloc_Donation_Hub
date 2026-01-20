

import { useState, useCallback, useEffect } from 'react';
import { getChainConfig, isChainSupported } from '../utils/chainConfig';

export interface WalletState {
    account: string | null;
    chainId: number | null;
    isConnecting: boolean;
    isConnected: boolean;
    error: string | null;
    balance: string | null;
    ensName: string | null;
    avatar: string | null;
}

export type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase';

const DEV_MODE = true;

const MOCK_WALLET = {
    account: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    chainId: 1,
    balance: '0x15af1d78b58c40000',
};

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
    });


    useEffect(() => {

        if (DEV_MODE) {
            console.log('🔧 DEV MODE: Using mock wallet connection');
            return;
        }

        const init = async () => {
            if (typeof window.ethereum === 'undefined') return;

            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                }) as string[];

                if (accounts.length > 0) {
                    setState(prev => ({
                        ...prev,
                        account: accounts[0],
                        isConnected: true
                    }));

                    const balance = await window.ethereum.request({
                        method: 'eth_getBalance',
                        params: [accounts[0], 'latest'],
                    }) as string;

                    setState(prev => ({ ...prev, balance }));
                }

                const chainIdHex = await window.ethereum.request({
                    method: 'eth_chainId'
                }) as string;

                const chainId = parseInt(chainIdHex, 16);
                setState(prev => ({ ...prev, chainId }));

            } catch (err) {
                console.error('Error checking wallet connection:', err);
            }
        };

        void init();

        if (window.ethereum?.on) {
            const handleAccountsChanged = (args: unknown) => {
                const accounts = args as string[];
                if (accounts.length === 0) {
                    setState(prev => ({
                        ...prev,
                        account: null,
                        isConnected: false,
                        balance: null,
                        ensName: null,
                        avatar: null,
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        account: accounts[0],
                        isConnected: true
                    }));

                    window.ethereum?.request({
                        method: 'eth_getBalance',
                        params: [accounts[0], 'latest'],
                    }).then((balance) => {
                        setState(prev => ({ ...prev, balance: balance as string }));
                    });
                }
            };

            const handleChainChanged = (args: unknown) => {
                const chainIdHex = args as string;
                const chainId = parseInt(chainIdHex, 16);
                setState(prev => ({ ...prev, chainId }));
            };

            const handleDisconnect = () => {
                setState({
                    account: null,
                    chainId: null,
                    isConnecting: false,
                    isConnected: false,
                    error: null,
                    balance: null,
                    ensName: null,
                    avatar: null,
                });
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


    const connect = async () => {

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

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            }) as string[];

            if (accounts.length > 0) {

                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [accounts[0], 'latest'],
                }) as string;

                const chainIdHex = await window.ethereum.request({
                    method: 'eth_chainId'
                }) as string;
                const chainId = parseInt(chainIdHex, 16);

                setState(prev => ({
                    ...prev,
                    account: accounts[0],
                    chainId,
                    balance,
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                }));
            }
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


    const disconnect = useCallback(() => {

        if (DEV_MODE) {
            console.log('🔧 DEV MODE: Disconnect simulated (wallet remains connected)');
            return;
        }

        setState({
            account: null,
            chainId: null,
            isConnecting: false,
            isConnected: false,
            error: null,
            balance: null,
            ensName: null,
            avatar: null,
        });
    }, []);


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

            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainConfig.chainIdHex }],
            });

            setState(prev => ({ ...prev, chainId: targetChainId, error: null }));
            return true;

        } catch (switchError: unknown) {
            const error = switchError as { code?: number };

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


    const isCurrentChainSupported = useCallback(() => {
        return state.chainId ? isChainSupported(state.chainId) : false;
    }, [state.chainId]);


    const getCurrentChainConfig = useCallback(() => {
        return state.chainId ? getChainConfig(state.chainId) : null;
    }, [state.chainId]);


    const refreshBalance = useCallback(async () => {
        if (!state.account || !window.ethereum) return;

        try {
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [state.account, 'latest'],
            }) as string;

            setState(prev => ({ ...prev, balance }));
        } catch (error) {
            console.error('Error refreshing balance:', error);
        }
    }, [state.account]);

    return {
        ...state,
        connect,
        disconnect,
        switchNetwork,
        isCurrentChainSupported,
        getCurrentChainConfig,
        refreshBalance,
    };
};
