/**
 * Wallet Connection Modal
 * Beautiful glassmorphic modal for connecting Web3 wallets
 */

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Button,
    IconButton,
    Alert,
    CircularProgress,
    Divider,
    alpha,
} from '@mui/material';
import {
    Close,
    AccountBalanceWallet,
    Warning,
    CheckCircle,
} from '@mui/icons-material';
import { useWallet, type WalletProvider } from '../../hooks/useWallet';
import { motion, AnimatePresence } from 'motion/react';

interface WalletConnectionModalProps {
    open: boolean;
    onClose: () => void;
    onConnect?: () => void;
}

interface WalletOption {
    id: WalletProvider;
    name: string;
    icon: string;
    description: string;
    isInstalled: boolean;
    downloadUrl?: string;
}

const WalletConnectionModal = ({
    open,
    onClose,
    onConnect
}: WalletConnectionModalProps) => {
    const { connect, isConnecting, error, isConnected } = useWallet();
    const [selectedWallet, setSelectedWallet] = useState<WalletProvider | null>(null);

    // Wallet options
    const walletOptions: WalletOption[] = [
        {
            id: 'metamask',
            name: 'MetaMask',
            icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
            description: 'Most popular Ethereum wallet',
            isInstalled: typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
            downloadUrl: 'https://metamask.io/download/',
        },
        {
            id: 'walletconnect',
            name: 'WalletConnect',
            icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Gradient/Icon.svg',
            description: 'Connect with mobile wallets',
            isInstalled: true, // WalletConnect doesn't require installation
        },
        {
            id: 'coinbase',
            name: 'Coinbase Wallet',
            icon: 'https://www.coinbase.com/img/favicon/favicon-32x32.png',
            description: 'Secure & easy-to-use wallet',
            isInstalled: typeof window.ethereum !== 'undefined',
            downloadUrl: 'https://www.coinbase.com/wallet',
        },
    ];

    const handleWalletSelect = async (walletId: WalletProvider) => {
        const wallet = walletOptions.find(w => w.id === walletId);

        if (!wallet?.isInstalled && wallet?.downloadUrl) {
            window.open(wallet.downloadUrl, '_blank');
            return;
        }

        setSelectedWallet(walletId);
        await connect(walletId);

        if (onConnect) {
            onConnect();
        }
    };

    const handleClose = () => {
        if (!isConnecting) {
            setSelectedWallet(null);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'rgba(11, 0, 26, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 2,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccountBalanceWallet sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Connect Wallet
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleClose}
                    size="small"
                    disabled={isConnecting}
                    sx={{
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary' },
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 3 }}>
                <AnimatePresence mode="wait">
                    {isConnected ? (
                        // Success State
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CheckCircle
                                    sx={{
                                        fontSize: 80,
                                        color: 'success.main',
                                        filter: 'drop-shadow(0 0 20px rgba(0, 240, 144, 0.4))',
                                        mb: 2,
                                    }}
                                />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                    Wallet Connected!
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                                    Your wallet has been successfully connected
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleClose}
                                    fullWidth
                                    sx={{ maxWidth: 200 }}
                                >
                                    Get Started
                                </Button>
                            </Box>
                        </motion.div>
                    ) : isConnecting ? (
                        // Loading State
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress
                                    size={60}
                                    sx={{
                                        mb: 3,
                                        '& .MuiCircularProgress-circle': {
                                            filter: 'drop-shadow(0 0 10px rgba(82, 39, 255, 0.4))',
                                        },
                                    }}
                                />
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    Connecting...
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Please approve the connection in your wallet
                                </Typography>
                            </Box>
                        </motion.div>
                    ) : (
                        // Wallet Selection State
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Info Banner */}
                            <Alert
                                severity="info"
                                icon={<Warning />}
                                sx={{
                                    mb: 3,
                                    bgcolor: alpha('#00E5FF', 0.1),
                                    borderLeft: '3px solid #00E5FF',
                                    '& .MuiAlert-icon': { color: '#00E5FF' },
                                }}
                            >
                                Choose a wallet to connect and start making donations
                            </Alert>

                            {/* Error Message */}
                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        bgcolor: alpha('#FF2E54', 0.1),
                                        borderLeft: '3px solid #FF2E54',
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            {/* Wallet Options */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {walletOptions.map((wallet, index) => (
                                    <motion.div
                                        key={wallet.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Box
                                            onClick={() => handleWalletSelect(wallet.id)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                p: 2.5,
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: 'rgba(255, 255, 255, 0.06)',
                                                    border: '1px solid rgba(82, 39, 255, 0.5)',
                                                    transform: 'translateX(4px)',
                                                    boxShadow: '0 0 20px rgba(82, 39, 255, 0.2)',
                                                },
                                            }}
                                        >
                                            {/* Wallet Icon */}
                                            <Box
                                                component="img"
                                                src={wallet.icon}
                                                alt={wallet.name}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 1.5,
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    p: 1,
                                                }}
                                            />

                                            {/* Wallet Info */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: 600, mb: 0.5 }}
                                                >
                                                    {wallet.name}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    {wallet.description}
                                                </Typography>
                                            </Box>

                                            {/* Status Badge */}
                                            {!wallet.isInstalled && wallet.downloadUrl && (
                                                <Box
                                                    sx={{
                                                        px: 2,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        bgcolor: 'rgba(255, 204, 0, 0.15)',
                                                        border: '1px solid rgba(255, 204, 0, 0.3)',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#FFCC00',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Install
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </motion.div>
                                ))}
                            </Box>

                            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                            {/* Footer Info */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                                >
                                    New to Ethereum wallets?
                                </Typography>
                                <Button
                                    variant="text"
                                    size="small"
                                    href="https://ethereum.org/en/wallets/"
                                    target="_blank"
                                    sx={{
                                        color: 'primary.main',
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: 'rgba(82, 39, 255, 0.1)',
                                        },
                                    }}
                                >
                                    Learn more about wallets
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

export default WalletConnectionModal;
