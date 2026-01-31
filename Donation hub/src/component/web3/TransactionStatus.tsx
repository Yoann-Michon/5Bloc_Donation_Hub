

import { Box, Typography, CircularProgress, Alert, Button, Collapse } from '@mui/material';
import {
    CheckCircle,
    Error as ErrorIcon,
    Pending,
    OpenInNew,
    ContentCopy,
} from '@mui/icons-material';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
    formatTxHash,
    getExplorerUrl,
    copyToClipboard,
    weiToGwei,
} from '../../utils/web3Utils';
import { useTransactionStatus, type TransactionStatus as TxStatus } from '../../hooks/useTransactionStatus';

interface TransactionStatusProps {
    txHash: string | null;
    chainId: number;
    onSuccess?: () => void;
    onError?: () => void;
    requiredConfirmations?: number;
    showDetails?: boolean;
}

const TransactionStatusIndicator = ({
    txHash,
    chainId,
    onSuccess,
    onError,
    requiredConfirmations = 1,
    showDetails = true,
}: TransactionStatusProps) => {
    const { transaction } = useTransactionStatus(txHash, requiredConfirmations);
    const [showFullHash, setShowFullHash] = useState(false);
    const [hashCopied, setHashCopied] = useState(false);

    React.useEffect(() => {
        if (transaction?.status === 'confirmed' && onSuccess) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00F090', '#00E5FF', '#5227FF'],
            });
            onSuccess();
        } else if (transaction?.status === 'failed' && onError) {
            onError();
        }
    }, [transaction?.status, onSuccess, onError]);

    const handleCopyHash = async () => {
        if (txHash) {
            const success = await copyToClipboard(txHash);
            if (success) {
                setHashCopied(true);
                setTimeout(() => setHashCopied(false), 2000);
            }
        }
    };

    const handleOpenExplorer = () => {
        if (txHash) {
            const url = getExplorerUrl(chainId, txHash);
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    if (!txHash) return null;

    const getStatusConfig = (status: TxStatus | undefined) => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Pending sx={{ fontSize: 48 }} />,
                    color: '#FFCC00',
                    title: 'Transaction Pending',
                    message: 'Waiting for blockchain confirmation...',
                    severity: 'info' as const,
                };
            case 'confirming':
                return {
                    icon: <CircularProgress size={48} />,
                    color: '#00E5FF',
                    title: 'Confirming Transaction',
                    message: `${transaction?.confirmations || 0} / ${requiredConfirmations} confirmations`,
                    severity: 'info' as const,
                };
            case 'confirmed':
                return {
                    icon: <CheckCircle sx={{ fontSize: 48 }} />,
                    color: '#00F090',
                    title: 'Transaction Confirmed',
                    message: 'Your transaction was successful!',
                    severity: 'success' as const,
                };
            case 'failed':
                return {
                    icon: <ErrorIcon sx={{ fontSize: 48 }} />,
                    color: '#FF2E54',
                    title: 'Transaction Failed',
                    message: transaction?.error || 'Transaction was reverted',
                    severity: 'error' as const,
                };
            default:
                return {
                    icon: <Pending sx={{ fontSize: 48 }} />,
                    color: '#5227FF',
                    title: 'Processing',
                    message: 'Checking transaction status...',
                    severity: 'info' as const,
                };
        }
    };

    const config = getStatusConfig(transaction?.status);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={transaction?.status || 'loading'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
            >
                <Alert
                    severity={config.severity}
                    icon={false}
                    sx={{
                        background: 'rgba(11, 0, 26, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${config.color}40`,
                        borderRadius: 2,
                        py: 3,
                    }}
                >
                    {/* Status Icon */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: transaction?.status === 'confirming' ? 360 : 0,
                            }}
                            transition={{
                                duration: 2,
                                repeat: transaction?.status === 'confirming' ? Infinity : 0,
                                ease: 'easeInOut',
                            }}
                        >
                            <Box sx={{ color: config.color, filter: `drop-shadow(0 0 10px ${config.color}80)` }}>
                                {config.icon}
                            </Box>
                        </motion.div>
                    </Box>

                    {/* Status Text */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            textAlign: 'center',
                            mb: 1,
                        }}
                    >
                        {config.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            textAlign: 'center',
                            mb: showDetails ? 3 : 0,
                        }}
                    >
                        {config.message}
                    </Typography>

                    {/* Transaction Details */}
                    {showDetails && (
                        <Collapse in={showDetails}>
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: 2,
                                }}
                            >
                                {/* Transaction Hash */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                                    >
                                        Transaction Hash
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: 'monospace',
                                                wordBreak: 'break-all',
                                                flex: 1,
                                            }}
                                            onClick={() => setShowFullHash(!showFullHash)}
                                        >
                                            {showFullHash ? txHash : formatTxHash(txHash)}
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={handleCopyHash}
                                            sx={{ minWidth: 'auto', p: 0.5 }}
                                        >
                                            {hashCopied ? (
                                                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                                            ) : (
                                                <ContentCopy sx={{ fontSize: 16 }} />
                                            )}
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Block Number */}
                                {transaction?.blockNumber && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                                        >
                                            Block Number
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {transaction.blockNumber.toLocaleString()}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Gas Used */}
                                {transaction?.gasUsed && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                                        >
                                            Gas Used
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {parseInt(transaction.gasUsed).toLocaleString()} ({weiToGwei(transaction.gasUsed)} Gwei)
                                        </Typography>
                                    </Box>
                                )}

                                {/* Confirmations */}
                                {transaction?.confirmations !== undefined && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                                        >
                                            Confirmations
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {transaction.confirmations}
                                            </Typography>
                                            {transaction.confirmations < requiredConfirmations && (
                                                <CircularProgress
                                                    variant="determinate"
                                                    value={(transaction.confirmations / requiredConfirmations) * 100}
                                                    size={20}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                )}

                                {/* View on Explorer */}
                                <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onClick={handleOpenExplorer}
                                    endIcon={<OpenInNew />}
                                    sx={{
                                        mt: 1,
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'text.primary',
                                        '&:hover': {
                                            borderColor: config.color,
                                            bgcolor: `${config.color}20`,
                                        },
                                    }}
                                >
                                    View on Block Explorer
                                </Button>
                            </Box>
                        </Collapse>
                    )}
                </Alert>
            </motion.div>
        </AnimatePresence>
    );
};

export default TransactionStatusIndicator;
