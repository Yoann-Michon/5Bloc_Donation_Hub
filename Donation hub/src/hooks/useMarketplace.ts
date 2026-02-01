import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { getMarketplaceAddress, getContractAddress } from '../contracts/contractLoader';

const MARKETPLACE_ABI = [
    "function listBadge(uint256 tokenId, uint256 price) external",
    "function buyBadge(uint256 listingId) external payable",
    "function cancelListing(uint256 listingId) external",
    "function getAllActiveListings() external view returns (tuple(uint256 listingId, uint256 tokenId, address seller, uint256 price, bool active)[])"
];

const BADGE_ABI = [
    "function approve(address to, uint256 tokenId) external",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function tokenURI(uint256 tokenId) view returns (string)"
];

export interface MarketplaceListing {
    listingId: number;
    tokenId: number;
    seller: string;
    price: string;
    active: boolean;
    metadata?: any;
}

export const useMarketplace = () => {
    const { signer, account, isConnected } = useWallet();
    const [listings, setListings] = useState<MarketplaceListing[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getMarketplaceContract = useCallback(() => {
        const address = getMarketplaceAddress();
        if (!signer || !address || address === '0x0000000000000000000000000000000000000000') return null;
        return new ethers.Contract(address, MARKETPLACE_ABI, signer);
    }, [signer]);

    const getBadgeContract = useCallback(() => {
        const address = getContractAddress();
        if (!signer || !address || address === '0x0000000000000000000000000000000000000000') return null;
        return new ethers.Contract(address, BADGE_ABI, signer);
    }, [signer]);

    const fetchListings = useCallback(async () => {
        const contract = getMarketplaceContract();
        if (!contract) return;

        setIsLoading(true);
        try {
            const data = await contract.getAllActiveListings();
            const formattedListings: MarketplaceListing[] = data.map((item: any) => ({
                listingId: Number(item.listingId),
                tokenId: Number(item.tokenId),
                seller: item.seller,
                price: ethers.formatEther(item.price),
                active: item.active
            }));

            setListings(formattedListings);
        } catch (error) {
            console.error("Failed to fetch listings:", error);
        } finally {
            setIsLoading(false);
        }
    }, [getMarketplaceContract]);

    const listBadge = async (tokenId: number, priceEth: string) => {
        const marketContract = getMarketplaceContract();
        const badgeContract = getBadgeContract();
        if (!marketContract || !badgeContract || !account) throw new Error("Contracts not initialized");

        const price = ethers.parseEther(priceEth);
        const marketAddress = getMarketplaceAddress();


        const approved = await badgeContract.getApproved(tokenId);
        const isApprovedAll = await badgeContract.isApprovedForAll(account, marketAddress);

        if (approved.toLowerCase() !== marketAddress.toLowerCase() && !isApprovedAll) {
            const approveTx = await badgeContract.approve(marketAddress, tokenId);
            await approveTx.wait();
        }

        const tx = await marketContract.listBadge(tokenId, price);
        await tx.wait();
        await fetchListings();
    };

    const buyBadge = async (listingId: number, priceEth: string) => {
        const contract = getMarketplaceContract();
        if (!contract) throw new Error("Contract not initialized");

        const tx = await contract.buyBadge(listingId, {
            value: ethers.parseEther(priceEth)
        });
        await tx.wait();
        await fetchListings();
    };

    const cancelListing = async (listingId: number) => {
        const contract = getMarketplaceContract();
        if (!contract) throw new Error("Contract not initialized");

        const tx = await contract.cancelListing(listingId);
        await tx.wait();
        await fetchListings();
    };

    useEffect(() => {
        if (isConnected) {
            fetchListings();
        }
    }, [isConnected, fetchListings]);

    return {
        listings,
        isLoading,
        fetchListings,
        listBadge,
        buyBadge,
        cancelListing
    };
};
