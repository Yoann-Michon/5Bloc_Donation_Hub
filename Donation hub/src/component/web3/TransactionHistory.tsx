/**
 * Transaction History Component
 * Displays user's transaction history with filtering and search
 */

import { useState } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Button,
    Divider,
    alpha,
} from '@mui/material';
import {
    Search,
    FilterList,
    OpenInNew,
    ArrowUpward,
    ArrowDownward,
    Refresh,
} from '@mui/icons-material';
import { formatBalance, formatTimeAgo, formatTxHash, getExplorerUrl } from '../../utils/web3Utils';
import { motion, AnimatePresence } from 'motion/react';

interface Transaction {
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

interface TransactionHistoryProps {
    transactions: Transaction[];
    isLoading?: boolean;
    onRefresh?: () => void;
}

const TransactionHistory = ({
    transactions = [],
    isLoading = false,
    onRefresh,
}: TransactionHistoryProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    // Filter transactions
    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch =
            tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.to.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterType === 'all' || tx.type === filterType;

        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: Transaction['status']) => {
        switch (status) {
            case 'confirmed':
                return '#00F090';
            case 'pending':
                return '#FFCC00';
            case 'failed':
                return '#FF2E54';
            default:
                return '#5227FF';
        }
    };

    const getTypeIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'send':
                return <ArrowUpward sx={{ fontSize: 20, color: 'error.main' }} />;
            case 'receive':
                return <ArrowDownward sx={{ fontSize: 20, color: 'success.main' }} />;
            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                background: 'rgba(11, 0, 26, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 2,
                p: 3,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Transaction History
                </Typography>
                {onRefresh && (
                    <IconButton
                        onClick={onRefresh}
                        disabled={isLoading}
                        sx={{
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' },
                        }}
                    >
                        <motion.div
                            animate={{ rotate: isLoading ? 360 : 0 }}
                            transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
                        >
                            <Refresh />
                        </motion.div>
                    </IconButton>
                )}
            </Box>

            {/* Search and Filter */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                        },
                    }}
                />
                <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => {
                        const types = ['all', 'send', 'receive', 'approve', 'other'];
                        const currentIndex = types.indexOf(filterType);
                        const nextIndex = (currentIndex + 1) % types.length;
                        setFilterType(types[nextIndex]);
                    }}
                    sx={{
                        minWidth: 120,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'text.primary',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(82, 39, 255, 0.1)',
                        },
                    }}
                >
                    {filterType === 'all' ? 'All' : filterType}
                </Button>
            </Box>

            {/* Transaction List */}
            {isLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Loading transactions...
                    </Typography>
                </Box>
            ) : filteredTransactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No transactions found
                    </Typography>
                </Box>
            ) : (
                <List sx={{ p: 0 }}>
                    <AnimatePresence>
                        {filteredTransactions.map((tx, index) => (
                            <motion.div
                                key={tx.hash}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ListItem
                                    sx={{
                                        px: 0,
                                        py: 2,
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                                        },
                                    }}
                                >
                                    {/* Type Icon */}
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            bgcolor: alpha(getStatusColor(tx.status), 0.15),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2,
                                        }}
                                    >
                                        {getTypeIcon(tx.type)}
                                    </Box>

                                    {/* Transaction Info */}
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                                </Typography>
                                                <Chip
                                                    label={tx.status}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: 11,
                                                        bgcolor: alpha(getStatusColor(tx.status), 0.15),
                                                        color: getStatusColor(tx.status),
                                                        border: `1px solid ${alpha(getStatusColor(tx.status), 0.3)}`,
                                                    }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        fontFamily: 'monospace',
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {formatTxHash(tx.hash, 8)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {formatTimeAgo(tx.timestamp)}
                                                </Typography>
                                            </Box>
                                        }
                                    />

                                    {/* Amount */}
                                    <Box sx={{ textAlign: 'right', mr: 2 }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 600,
                                                color: tx.type === 'send' ? 'error.main' : 'success.main',
                                            }}
                                        >
                                            {tx.type === 'send' ? '-' : '+'}
                                            {formatBalance(tx.amount, 18, 4)} {tx.token}
                                        </Typography>
                                    </Box>

                                    {/* Explorer Link */}
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            const url = getExplorerUrl(tx.chainId, tx.hash);
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                        }}
                                        sx={{
                                            color: 'text.secondary',
                                            '&:hover': { color: 'primary.main' },
                                        }}
                                    >
                                        <OpenInNew sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </ListItem>
                                {index < filteredTransactions.length - 1 && (
                                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </List>
            )}
        </Box>
    );
};

export default TransactionHistory;
