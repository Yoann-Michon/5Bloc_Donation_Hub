

import { useState, useCallback, useEffect } from 'react';
import { getChainConfig, isChainSupported } from '../utils/chainConfig';
import { BrowserProvider, Contract, type InterfaceAbi, formatEther, type Signer } from 'ethers';
import { getContractAddress } from '../contracts/contractLoader';

export interface WalletState {
    account: string | null;
    chainId: number | null;
    isConnecting: boolean;
    isConnected: boolean;
    error: string | null;
    balance: string | null;
    user: any | null;
    ensName: string | null;
    avatar: string | null;
    signer: Signer | null;
    isInitialized: boolean;
}

export type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase';

const DONATION_BADGE_ABI = [
    "function donate(uint256 projectId, string memory tokenURI) external payable",
    "function balanceOf(address owner) view returns (uint256)",
    "function lastActionTimestamp(address user) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function getTokensByOwner(address owner) view returns (uint256[])",
    "function fuseBadges(uint256 tokenId1, uint256 tokenId2, string memory newMetadataURI) external",
    "function getTierFromTokenId(uint256 tokenId) view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export const useWallet = () => {
    const [state, setState] = useState<WalletState>({
        account: null,
        chainId: null,
        isConnecting: false,
        isConnected: false,
        error: null,
        balance: null,
        user: null,
        ensName: null,
        avatar: null,
        signer: null,
        isInitialized: false,
    });


    useEffect(() => {
        const init = async () => {
            if (typeof window.ethereum === 'undefined') {
                setState(prev => ({ ...prev, isInitialized: true }));
                return;
            }

            const wasConnected = localStorage.getItem('wallet_was_connected') === 'true';
            if (!wasConnected) {
                const provider = new BrowserProvider(window.ethereum);
                const network = await provider.getNetwork();
                setState(prev => ({ ...prev, chainId: Number(network.chainId), isInitialized: true }));
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

                    localStorage.setItem('wallet_was_connected', 'true');

                    setState(prev => ({
                        ...prev,
                        account: address,
                        isConnected: true,
                        chainId: Number(network.chainId),
                        balance: formatEther(balance),
                        signer: signer,
                    }));

                    // Restore user data from JWT if available
                    const jwtToken = localStorage.getItem('jwt_token');
                    if (jwtToken) {
                        try {
                            const { getCurrentUser } = await import('../utils/api');
                            const user = await getCurrentUser();
                            setState(prev => ({ ...prev, user }));
                        } catch (apiError) {
                            console.error('Failed to restore user data:', apiError);
                            // If JWT is invalid, remove it
                            localStorage.removeItem('jwt_token');
                        }
                    }
                } else {
                    localStorage.removeItem('wallet_was_connected');
                    const network = await provider.getNetwork();
                    setState(prev => ({ ...prev, chainId: Number(network.chainId) }));
                }

            } catch (err) {
                localStorage.removeItem('wallet_was_connected');
            } finally {
                setState(prev => ({ ...prev, isInitialized: true }));
            }
        };

        void init();

        if (window.ethereum?.on) {
            const handleAccountsChanged = async (args: unknown) => {
                const accounts = args as string[];
                if (accounts.length === 0) {
                    localStorage.removeItem('wallet_was_connected');
                    localStorage.removeItem('jwt_token');
                    setState(prev => ({
                        ...prev,
                        account: null,
                        isConnected: false,
                        balance: null,
                        ensName: null,
                        avatar: null,
                        signer: null,
                        user: null,
                    }));
                } else {
                    const provider = new BrowserProvider(window.ethereum!);
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    const balance = await provider.getBalance(address);

                    const currentAccount = state.account;
                    if (currentAccount && address.toLowerCase() !== currentAccount.toLowerCase()) {
                        localStorage.removeItem('jwt_token');
                    }

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


    const connect = async () => {
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

            localStorage.setItem('wallet_was_connected', 'true');

            try {
                const { getNonce, verifySignature } = await import('../utils/api');

                const { nonce } = await getNonce(address);

                const message = `Sign this nonce to authenticate: ${nonce}`;
                const signature = await signer.signMessage(message);

                const { accessToken, user } = await verifySignature(address, signature);

                localStorage.setItem('jwt_token', accessToken);

                setState(prev => ({ ...prev, user }));
            } catch (apiError) {
                console.error('Failed to authenticate user:', apiError);
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
        localStorage.removeItem('wallet_was_connected');
        localStorage.removeItem('jwt_token');
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
            user: null,
        }));
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
                    setState(prev => ({
                        ...prev,
                        error: 'Failed to add network'
                    }));
                    return false;
                }
            }

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
            const provider = new BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(state.account);

            setState(prev => ({ ...prev, balance: formatEther(balance) }));
        } catch (error) {
        }
    }, [state.account]);


    const getContract = useCallback((address: string, abi: InterfaceAbi) => {
        if (!state.signer) return null;
        try {
            return new Contract(address, abi, state.signer);
        } catch (error) {
            return null;
        }
    }, [state.signer]);


    const getBadgeContract = useCallback(() => {
        const contractAddress = getContractAddress();
        if (!state.signer || !contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') return null;
        try {
            return new Contract(contractAddress, DONATION_BADGE_ABI, state.signer);
        } catch (error) {
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
