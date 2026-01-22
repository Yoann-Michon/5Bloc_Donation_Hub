
import { useState, useCallback, useEffect } from 'react';
import { useWallet } from './useWallet';

// Matches the interface in TransactionHistory.tsx
export interface Transaction {
    hash: string;
    type: 'send' | 'receive' | 'approve' | 'mint' | 'other';
    amount: string;
    token: string;
    from: string;
    to: string;
    timestamp: number;
    status: 'confirmed' | 'pending' | 'failed';
    chainId: number;
}

export const useDonationHistory = () => {
    const { account, getBadgeContract, chainId } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!account) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const contract = getBadgeContract();
            if (!contract) return;

            // Get Transfer events (mints)
            const filter = contract.filters.Transfer(null, account);
            const events = await contract.queryFilter(filter);
            
            // Sort by block number descending (newest first)
            const sortedEvents = events.reverse();

            const txs: Transaction[] = [];

            for (const event of sortedEvents) {
                try {
                    const block = await event.getBlock();
                    const tokenId = (event as any).args[2];
                    
                    // Fetch metadata to get the value
                    const tokenURI = await contract.tokenURI(tokenId);
                    let value = '0';
                    
                    if (tokenURI.startsWith('ipfs://')) {
                         // Simulation logic matching BadgeGallery
                         // In real app: fetch(https://ipfs.io/ipfs/...)
                         // Here we assume standard mock metadata
                         // const hash = tokenURI.replace('ipfs://', '');
                         // Check if we can extract value from hash or if we need to mock it
                         // For now, consistent mock:
                         value = (Number(tokenId) % 2 === 0) ? '0.5' : '1.5'; 
                         
                         // If we preserved the value in the hash, we could extract it, but we didn't.
                         // However, the user flow mocks 1.5 for Gold and <1 for Bronze.
                    }

                    txs.push({
                        hash: event.transactionHash,
                        type: 'mint', // It's a mint (donation receipt)
                        amount: value,
                        token: 'ETH',
                        from: '0x0000000000000000000000000000000000000000',
                        to: account,
                        timestamp: block.timestamp * 1000,
                        status: 'confirmed',
                        chainId: chainId || 31337
                    });
                } catch (err) {
                    console.error("Error processing event", err);
                }
            }
            
            setTransactions(txs);

        } catch (err) {
            console.error("Error fetching history", err);
            setError("Failed to fetch history");
        } finally {
            setIsLoading(false);
        }
    }, [account, getBadgeContract, chainId]);

    useEffect(() => {
        if (account) {
            fetchHistory();
        } else {
            setTransactions([]);
        }
    }, [account, fetchHistory]);

    return { transactions, isLoading, error, refresh: fetchHistory };
};
