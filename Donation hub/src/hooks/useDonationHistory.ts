
import { useState, useCallback, useEffect } from 'react';
import { formatEther } from 'ethers';
import { useWallet } from './useWallet';


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

            const filter = contract.filters.Transfer(null, account);
            const events = await contract.queryFilter(filter);

            const sortedEvents = events.reverse();

            const txs: Transaction[] = [];

            for (const event of sortedEvents) {
                try {
                    const block = await event.getBlock();

                    const tx = await event.getTransaction();
                    const value = formatEther(tx.value);

                    txs.push({
                        hash: event.transactionHash,
                        type: 'mint',
                        amount: value,
                        token: 'ETH',
                        from: '0x0000000000000000000000000000000000000000',
                        to: account,
                        timestamp: block.timestamp * 1000,
                        status: 'confirmed',
                        chainId: chainId || 31337
                    });
                } catch (err) {

                }
            }

            setTransactions(txs);

        } catch (err) {
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
