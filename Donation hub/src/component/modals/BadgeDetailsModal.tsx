import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Chip,
    Divider,
    Avatar,
} from '@mui/material';
import { Close, OpenInNew, CalendarToday, Person, Fingerprint } from '@mui/icons-material';
import type { Badge } from '../dashboard/BadgeGallery';

interface BadgeDetailsModalProps {
    open: boolean;
    onClose: () => void;
    badge: Badge | null;
}

const BadgeDetailsModal = ({ open, onClose, badge }: BadgeDetailsModalProps) => {
    if (!badge) return null;

    const formatDate = (timestamp?: string) => {
        if (!timestamp) return 'N/A';
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const openIPFS = () => {
        if (badge.hash) {
            window.open(`https://gateway.pinata.cloud/ipfs/${badge.hash}`, '_blank');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'rgba(25, 24, 45, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
                    Badge Details
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={badge.image}
                            sx={{
                                width: 80,
                                height: 80,
                                border: `3px solid ${badge.color}`,
                                boxShadow: `0 0 20px ${badge.color}40`,
                            }}
                        >
                            {badge.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {badge.name}
                            </Typography>
                            <Chip
                                label={badge.tier}
                                size="small"
                                sx={{
                                    bgcolor: `${badge.color}20`,
                                    color: badge.color,
                                    fontWeight: 700,
                                    borderRadius: 1,
                                }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    {badge.description && (
                        <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Description
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {badge.description}
                            </Typography>
                        </Box>
                    )}

                    {badge.value && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ fontSize: 20, color: 'text.secondary' }} />
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Donation Amount
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {badge.value}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {badge.createdAt && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Created At
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {formatDate(badge.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {badge.hash && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Fingerprint sx={{ fontSize: 20, color: 'text.secondary' }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    IPFS Hash
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    p: 1.5,
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 1,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        wordBreak: 'break-all',
                                        color: 'text.secondary',
                                    }}
                                >
                                    {badge.hash}
                                </Typography>
                                <IconButton size="small" onClick={openIPFS} sx={{ color: 'primary.main' }}>
                                    <OpenInNew fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    )}

                    {badge.previousOwners && badge.previousOwners.length > 0 && (
                        <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Previous Owners ({badge.previousOwners.length})
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {badge.previousOwners.map((owner, index) => (
                                    <Typography
                                        key={index}
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            color: 'text.secondary',
                                            p: 1,
                                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: 1,
                                        }}
                                    >
                                        {owner}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default BadgeDetailsModal;
