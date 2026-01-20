/**
 * Address Display Component
 * Displays Ethereum address with ENS support and copy functionality
 */

import { useState } from 'react';
import { Box, Typography, Tooltip, IconButton, Chip, Avatar } from '@mui/material';
import { ContentCopy, CheckCircle, OpenInNew } from '@mui/icons-material';
import { formatAddress, copyToClipboard, getAddressExplorerUrl } from '../../utils/web3Utils';
import { useENS } from '../../hooks/useENS';
import { motion } from 'motion/react';

interface AddressDisplayProps {
    address: string;
    chainId?: number | null;
    showCopy?: boolean;
    showExplorer?: boolean;
    showAvatar?: boolean;
    variant?: 'default' | 'chip' | 'inline';
    chars?: number;
}

const AddressDisplay = ({
    address,
    chainId = 1,
    showCopy = true,
    showExplorer = false,
    showAvatar = true,
    variant = 'default',
    chars = 4,
}: AddressDisplayProps) => {
    const [copied, setCopied] = useState(false);
    const { name: ensName, avatar, isLoading } = useENS(address, chainId);

    const handleCopy = async () => {
        const success = await copyToClipboard(address);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOpenExplorer = () => {
        if (chainId) {
            const url = getAddressExplorerUrl(chainId, address);
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const displayText = ensName || formatAddress(address, chars);

    // Chip variant
    if (variant === 'chip') {
        return (
            <Chip
                avatar={
                    showAvatar ? (
                        <Avatar
                            src={avatar || undefined}
                            sx={{
                                width: 24,
                                height: 24,
                                bgcolor: 'primary.main',
                                fontSize: 12,
                            }}
                        >
                            {address.slice(2, 4).toUpperCase()}
                        </Avatar>
                    ) : undefined
                }
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {displayText}
                        </Typography>
                        {showCopy && (
                            <IconButton size="small" onClick={handleCopy} sx={{ p: 0.5 }}>
                                {copied ? (
                                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                                ) : (
                                    <ContentCopy sx={{ fontSize: 16 }} />
                                )}
                            </IconButton>
                        )}
                    </Box>
                }
                sx={{
                    bgcolor: 'rgba(82, 39, 255, 0.15)',
                    border: '1px solid rgba(82, 39, 255, 0.3)',
                    color: 'text.primary',
                    '& .MuiChip-label': { px: 1.5 },
                }}
            />
        );
    }

    // Inline variant
    if (variant === 'inline') {
        return (
            <Box
                component="span"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontFamily: 'monospace',
                    color: 'text.primary',
                }}
            >
                {showAvatar && avatar && (
                    <Avatar
                        src={avatar}
                        sx={{ width: 20, height: 20, display: 'inline-flex' }}
                    />
                )}
                <Typography
                    component="span"
                    variant="body2"
                    sx={{
                        fontFamily: 'monospace',
                        color: ensName ? 'primary.main' : 'text.primary',
                    }}
                >
                    {displayText}
                </Typography>
                {showCopy && (
                    <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                        <IconButton
                            size="small"
                            onClick={handleCopy}
                            sx={{ p: 0.25, ml: 0.5 }}
                        >
                            {copied ? (
                                <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                            ) : (
                                <ContentCopy sx={{ fontSize: 14 }} />
                            )}
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        );
    }

    // Default variant
    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 2,
            }}
        >
            {/* Avatar */}
            {showAvatar && (
                <Avatar
                    src={avatar || undefined}
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        fontSize: 14,
                        fontWeight: 600,
                    }}
                >
                    {address.slice(2, 4).toUpperCase()}
                </Avatar>
            )}

            {/* Address/ENS */}
            <Box>
                {isLoading ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Loading...
                    </Typography>
                ) : (
                    <>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                color: ensName ? 'primary.main' : 'text.primary',
                            }}
                        >
                            {displayText}
                        </Typography>
                        {ensName && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    fontFamily: 'monospace',
                                    fontSize: 10,
                                }}
                            >
                                {formatAddress(address, chars)}
                            </Typography>
                        )}
                    </>
                )}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                {showCopy && (
                    <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                        <IconButton
                            size="small"
                            onClick={handleCopy}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'text.primary' },
                            }}
                        >
                            {copied ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                >
                                    <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                                </motion.div>
                            ) : (
                                <ContentCopy sx={{ fontSize: 18 }} />
                            )}
                        </IconButton>
                    </Tooltip>
                )}

                {showExplorer && (
                    <Tooltip title="View on explorer">
                        <IconButton
                            size="small"
                            onClick={handleOpenExplorer}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'text.primary' },
                            }}
                        >
                            <OpenInNew sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
};

export default AddressDisplay;
