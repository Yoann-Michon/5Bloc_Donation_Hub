/**
 * Network Switcher Component
 * Displays current network and allows switching between supported chains
 */

import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    Chip,
    Alert,
    CircularProgress,
    alpha,
} from '@mui/material';
import {
    ExpandMore,
    CheckCircle,
    Warning,
    Circle,
} from '@mui/icons-material';
import { useWallet } from '../../hooks/useWallet';
import { SUPPORTED_CHAINS, getChainConfig } from '../../utils/chainConfig';
import { motion, AnimatePresence } from 'motion/react';

interface NetworkSwitcherProps {
    requiredChainId?: number;
    showWarning?: boolean;
    variant?: 'default' | 'compact' | 'button';
}

const NetworkSwitcher = ({
    requiredChainId,
    showWarning = true,
    variant = 'default',
}: NetworkSwitcherProps) => {
    const { chainId, switchNetwork, isCurrentChainSupported } = useWallet();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isSwitching, setIsSwitching] = useState(false);
    const open = Boolean(anchorEl);

    const currentChain = chainId ? getChainConfig(chainId) : null;
    const isWrongNetwork = requiredChainId && chainId !== requiredChainId;
    const isUnsupported = chainId && !isCurrentChainSupported();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSwitchNetwork = async (targetChainId: number) => {
        setIsSwitching(true);
        const success = await switchNetwork(targetChainId);
        setIsSwitching(false);

        if (success) {
            handleClose();
        }
    };

    // Compact indicator variant (for navbar)
    if (variant === 'compact') {
        return (
            <>
                <Chip
                    icon={
                        <Circle
                            sx={{
                                fontSize: 10,
                                color: isUnsupported || isWrongNetwork ? 'error.main' : 'success.main',
                            }}
                        />
                    }
                    label={currentChain?.displayName || 'Unknown'}
                    onClick={handleClick}
                    deleteIcon={<ExpandMore />}
                    onDelete={handleClick}
                    sx={{
                        bgcolor: alpha(currentChain?.color || '#5227FF', 0.15),
                        border: `1px solid ${alpha(currentChain?.color || '#5227FF', 0.3)}`,
                        color: 'text.primary',
                        '& .MuiChip-icon': {
                            ml: 1.5,
                        },
                        '&:hover': {
                            bgcolor: alpha(currentChain?.color || '#5227FF', 0.25),
                        },
                    }}
                />
                <NetworkMenu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    currentChainId={chainId}
                    onSwitchNetwork={handleSwitchNetwork}
                    isSwitching={isSwitching}
                />
            </>
        );
    }

    // Button variant
    if (variant === 'button') {
        return (
            <>
                <Button
                    variant="outlined"
                    onClick={handleClick}
                    endIcon={<ExpandMore />}
                    startIcon={
                        <Circle
                            sx={{
                                fontSize: 10,
                                color: isUnsupported || isWrongNetwork ? 'error.main' : 'success.main',
                            }}
                        />
                    }
                    sx={{
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'text.primary',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(82, 39, 255, 0.1)',
                        },
                    }}
                >
                    {currentChain?.displayName || 'Select Network'}
                </Button>
                <NetworkMenu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    currentChainId={chainId}
                    onSwitchNetwork={handleSwitchNetwork}
                    isSwitching={isSwitching}
                />
            </>
        );
    }

    // Default card variant
    return (
        <Box>
            {/* Network Display Card */}
            <Box
                onClick={handleClick}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isUnsupported || isWrongNetwork
                            ? 'rgba(255, 46, 84, 0.5)'
                            : 'rgba(255, 255, 255, 0.08)'
                        }`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderColor: 'primary.main',
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Status Indicator */}
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(currentChain?.color || '#5227FF', 0.2),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isUnsupported || isWrongNetwork ? (
                            <Warning sx={{ color: 'error.main' }} />
                        ) : (
                            <CheckCircle sx={{ color: 'success.main' }} />
                        )}
                    </Box>

                    {/* Network Info */}
                    <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            Current Network
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {currentChain?.displayName || 'Unknown Network'}
                        </Typography>
                    </Box>
                </Box>

                <ExpandMore sx={{ color: 'text.secondary' }} />
            </Box>

            {/* Wrong Network Warning */}
            <AnimatePresence>
                {showWarning && isWrongNetwork && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Alert
                            severity="warning"
                            sx={{
                                mt: 2,
                                bgcolor: alpha('#FFCC00', 0.1),
                                borderLeft: '3px solid #FFCC00',
                            }}
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    onClick={() => handleSwitchNetwork(requiredChainId!)}
                                    disabled={isSwitching}
                                >
                                    {isSwitching ? <CircularProgress size={16} /> : 'Switch'}
                                </Button>
                            }
                        >
                            Please switch to {getChainConfig(requiredChainId)?.displayName}
                        </Alert>
                    </motion.div>
                )}

                {showWarning && isUnsupported && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Alert
                            severity="error"
                            sx={{
                                mt: 2,
                                bgcolor: alpha('#FF2E54', 0.1),
                                borderLeft: '3px solid #FF2E54',
                            }}
                        >
                            Unsupported network. Please switch to a supported network.
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Network Menu */}
            <NetworkMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                currentChainId={chainId}
                onSwitchNetwork={handleSwitchNetwork}
                isSwitching={isSwitching}
            />
        </Box>
    );
};

// Network Selection Menu
interface NetworkMenuProps {
    anchorEl: null | HTMLElement;
    open: boolean;
    onClose: () => void;
    currentChainId: number | null;
    onSwitchNetwork: (chainId: number) => Promise<void>;
    isSwitching: boolean;
}

const NetworkMenu = ({
    anchorEl,
    open,
    onClose,
    currentChainId,
    onSwitchNetwork,
    isSwitching,
}: NetworkMenuProps) => {
    const supportedChains = Object.values(SUPPORTED_CHAINS);
    const mainnets = supportedChains.filter(chain => !chain.isTestnet);
    const testnets = supportedChains.filter(chain => chain.isTestnet);

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    mt: 1,
                    minWidth: 280,
                    background: 'rgba(11, 0, 26, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                },
            }}
        >
            {/* Mainnets */}
            <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    MAINNETS
                </Typography>
            </Box>
            {mainnets.map((chain) => (
                <MenuItem
                    key={chain.chainId}
                    onClick={() => onSwitchNetwork(chain.chainId)}
                    disabled={isSwitching}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                            bgcolor: 'rgba(82, 39, 255, 0.1)',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Circle sx={{ fontSize: 10, color: chain.color }} />
                        <Typography variant="body2">{chain.displayName}</Typography>
                    </Box>
                    {currentChainId === chain.chainId && (
                        <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                    )}
                </MenuItem>
            ))}

            {/* Testnets */}
            {testnets.length > 0 && (
                <>
                    <Box sx={{ px: 2, py: 1, mt: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            TESTNETS
                        </Typography>
                    </Box>
                    {testnets.map((chain) => (
                        <MenuItem
                            key={chain.chainId}
                            onClick={() => onSwitchNetwork(chain.chainId)}
                            disabled={isSwitching}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                py: 1.5,
                                px: 2,
                                '&:hover': {
                                    bgcolor: 'rgba(82, 39, 255, 0.1)',
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Circle sx={{ fontSize: 10, color: chain.color }} />
                                <Typography variant="body2">{chain.displayName}</Typography>
                            </Box>
                            {currentChainId === chain.chainId && (
                                <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                            )}
                        </MenuItem>
                    ))}
                </>
            )}
        </Menu>
    );
};

export default NetworkSwitcher;
