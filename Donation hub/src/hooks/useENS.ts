/**
 * ENS Hook
 * Resolves ENS names and avatars for Ethereum addresses
 */

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface ENSData {
    name: string | null;
    avatar: string | null;
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook to resolve ENS name and avatar for an address
 */
export const useENS = (address: string | null, chainId: number | null): ENSData => {
    const [data, setData] = useState<ENSData>({
        name: null,
        avatar: null,
        isLoading: false,
        error: null,
    });

    useEffect(() => {
        if (!address || !ethers.isAddress(address) || chainId !== 1) {
            setData({ name: null, avatar: null, isLoading: false, error: null });
            return;
        }

        const resolveENS = async () => {
            setData(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                // Use Ethers default provider for ENS lookups
                const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');

                // Resolve ENS name
                const ensName = await provider.lookupAddress(address);

                let avatar = null;
                if (ensName) {
                    // Resolve avatar if ENS name exists
                    const resolver = await provider.getResolver(ensName);
                    if (resolver) {
                        avatar = await resolver.getAvatar();
                    }
                }

                setData({
                    name: ensName,
                    avatar: avatar || null,
                    isLoading: false,
                    error: null,
                });

            } catch (error) {
                console.error('Error resolving ENS:', error);
                setData({
                    name: null,
                    avatar: null,
                    isLoading: false,
                    error: 'Failed to resolve ENS',
                });
            }
        };

        void resolveENS();
    }, [address, chainId]);

    return data;
};
