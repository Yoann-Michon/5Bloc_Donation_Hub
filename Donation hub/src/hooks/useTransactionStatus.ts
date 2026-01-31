
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export type TransactionStatus =
    | 'pending'
    | 'confirming'
    | 'confirmed'
    | 'failed'
    | 'replaced';

export interface TransactionData {
    hash: string;
    status: TransactionStatus;
    confirmations: number;
    blockNumber: number | null;
    timestamp: number | null;
    gasUsed: string | null;
    effectiveGasPrice: string | null;
    error: string | null;
}

interface UseTransactionStatusResult {
    transaction: TransactionData | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}


export const useTransactionStatus = (
    txHash: string | null,
    requiredConfirmations: number = 1
): UseTransactionStatusResult => {
    const [transaction, setTransaction] = useState<TransactionData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkTransaction = useCallback(async () => {
        if (!txHash || !window.ethereum) {
            setTransaction(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);

            const receipt = await provider.getTransactionReceipt(txHash);

            if (!receipt) {
                setTransaction({
                    hash: txHash,
                    status: 'pending',
                    confirmations: 0,
                    blockNumber: null,
                    timestamp: null,
                    gasUsed: null,
                    effectiveGasPrice: null,
                    error: null,
                });
            } else {
                const currentBlock = await provider.getBlockNumber();
                const confirmations = currentBlock - receipt.blockNumber + 1;

                const block = await provider.getBlock(receipt.blockNumber);

                let status: TransactionStatus;
                if (receipt.status === 0) {
                    status = 'failed';
                } else if (confirmations < requiredConfirmations) {
                    status = 'confirming';
                } else {
                    status = 'confirmed';
                }

                setTransaction({
                    hash: txHash,
                    status,
                    confirmations,
                    blockNumber: receipt.blockNumber,
                    timestamp: block?.timestamp || null,
                    gasUsed: receipt.gasUsed.toString(),
                    effectiveGasPrice: receipt.gasPrice?.toString() || null,
                    error: receipt.status === 0 ? 'Transaction failed' : null,
                });
            }

        } catch (err) {
            setError('Failed to fetch transaction status');
        } finally {
            setIsLoading(false);
        }
    }, [txHash, requiredConfirmations]);

    useEffect(() => {
        if (!txHash) return;

        checkTransaction();

        const interval = setInterval(() => {
            if (!transaction || transaction.status === 'pending' || transaction.status === 'confirming') {
                checkTransaction();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [txHash, transaction?.status, checkTransaction]);

    return {
        transaction,
        isLoading,
        error,
        refresh: checkTransaction,
    };
};
