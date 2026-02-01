import { Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, Grid, Card, CardContent, Chip, LinearProgress, Divider } from '@mui/material';
import { Close, EmojiEvents, Lock, Verified, History, Fingerprint, CalendarMonth } from '@mui/icons-material';
import type { Badge } from '../../types/badge';

interface BadgeCollectionModalProps {
    open: boolean;
    onClose: () => void;
    badges: Badge[];
}

const tierColors: Record<string, string> = {
    Common: '#9E9E9E',
    Rare: '#2196F3',
    Epic: '#9C27B0',
    Legendary: '#FF9800',
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFCC00',
    Diamond: '#00E5FF',
};

const tierGradients: Record<string, string> = {
    Common: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
    Rare: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    Epic: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
    Legendary: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    Bronze: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
    Silver: 'linear-gradient(135deg, #C0C0C0 0%, #B0B0B0 100%)',
    Gold: 'linear-gradient(135deg, #FFCC00 0%, #F4B400 100%)',
    Diamond: 'linear-gradient(135deg, #00E5FF 0%, #00B0FF 100%)',
};

const BadgeCollectionModal = ({ open, onClose, badges }: BadgeCollectionModalProps) => {
    const unlockedBadges = badges.filter(b => b.unlocked);
    const lockedBadges = badges.filter(b => !b.unlocked);

    const getTierColor = (tier: string) => tierColors[tier] || tierColors['Common'];
    const getTierGradient = (tier: string) => tierGradients[tier] || tierGradients['Common'];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'rgba(11, 0, 26, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    pb: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(82, 39, 255, 0.4)',
                        }}
                    >
                        <EmojiEvents sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography component="span" variant="h5" sx={{ fontWeight: 700 }}>
                            Badge Collection
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {unlockedBadges.length} / {badges.length} Unlocked
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                {/* Unlocked Badges Section */}
                {unlockedBadges.length > 0 && (
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmojiEvents sx={{ color: 'primary.main' }} />
                            Unlocked Badges ({unlockedBadges.length})
                        </Typography>
                        <Grid container spacing={3}>
                            {unlockedBadges.map((badge) => (
                                <Grid size={{ xs: 12, sm: 6, md: 6 }} key={badge.id}>
                                    <Card
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: 3,
                                            height: '100%',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                borderColor: getTierColor(badge.tier),
                                                boxShadow: `0 8px 24px ${getTierColor(badge.tier)}40`,
                                            },
                                        }}
                                    >
                                        {/* Tier Gradient Overlay */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: 4,
                                                background: getTierGradient(badge.tier),
                                            }}
                                        />

                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', gap: 3 }}>
                                                {/* Left Column: Image & Basic Info */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 100 }}>
                                                    <Box
                                                        sx={{
                                                            width: 80,
                                                            height: 80,
                                                            borderRadius: 2,
                                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: `0 4px 20px ${getTierColor(badge.tier)}40`,
                                                        }}
                                                    >
                                                        {badge.image ? (
                                                            <Box
                                                                component="img"
                                                                src={badge.image}
                                                                alt={badge.name}
                                                                sx={{ width: 60, height: 60, objectFit: 'contain' }}
                                                            />
                                                        ) : (
                                                            <EmojiEvents sx={{ fontSize: 40, color: getTierColor(badge.tier) }} />
                                                        )}
                                                    </Box>
                                                    <Chip
                                                        label={badge.tier}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `${getTierColor(badge.tier)}20`,
                                                            color: getTierColor(badge.tier),
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    />
                                                </Box>

                                                {/* Right Column: Metadata Certificate */}
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                        {badge.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 2 }}>
                                                        {badge.description}
                                                    </Typography>

                                                    <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.05)' }} />

                                                    {/* Certificate Section */}
                                                    <Box sx={{
                                                        p: 1.5,
                                                        bgcolor: 'rgba(0,0,0,0.2)',
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                            <Verified sx={{ fontSize: 12 }} />
                                                            Blockchain Metadata
                                                        </Typography>

                                                        {/* Resource Type */}
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Type</Typography>
                                                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>{badge.type || badge.tier}</Typography>
                                                        </Box>

                                                        {/* Blockchain Proof (Token ID) */}
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Preuve Blockchain</Typography>
                                                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>Token ID #{badge.id}</Typography>
                                                        </Box>

                                                        {/* Created Date */}
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                                                <CalendarMonth sx={{ fontSize: 10 }} /> Created
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'white' }}>
                                                                {badge.createdAt ? new Date(typeof badge.createdAt === 'number' ? badge.createdAt * 1000 : badge.createdAt).toLocaleDateString() : 'N/A'}
                                                            </Typography>
                                                        </Box>

                                                        {/* IPFS Hash */}
                                                        <Box sx={{ mb: 0.5 }}>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                                                <Fingerprint sx={{ fontSize: 10 }} /> IPFS Hash
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                component="a"
                                                                href={badge.hash ? `https://gateway.pinata.cloud/ipfs/${badge.hash}` : '#'}
                                                                target="_blank"
                                                                sx={{
                                                                    display: 'block',
                                                                    fontFamily: 'monospace',
                                                                    color: 'primary.main',
                                                                    textDecoration: 'none',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    maxWidth: 200,
                                                                    '&:hover': { textDecoration: 'underline' }
                                                                }}
                                                            >
                                                                {badge.hash || 'Verified'}
                                                            </Typography>
                                                        </Box>

                                                        {/* Previous Owners */}
                                                        <Box>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                                                <History sx={{ fontSize: 10 }} /> History
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                                                {badge.previousOwners && badge.previousOwners.length > 0
                                                                    ? `${badge.previousOwners.length} previous owners`
                                                                    : 'Original Owner (Minted)'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Locked Badges Section */}
                {lockedBadges.length > 0 && (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Lock sx={{ color: 'text.secondary' }} />
                            Locked Badges ({lockedBadges.length})
                        </Typography>
                        <Grid container spacing={3}>
                            {lockedBadges.map((badge) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={badge.id}>
                                    <Card
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            borderRadius: 3,
                                            opacity: 0.6,
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                {/* Locked Badge Image */}
                                                <Box
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative',
                                                        filter: 'grayscale(100%)',
                                                    }}
                                                >
                                                    {badge.image ? (
                                                        <Box
                                                            component="img"
                                                            src={badge.image}
                                                            alt={badge.name}
                                                            sx={{ width: 60, height: 60, objectFit: 'contain', opacity: 0.3 }}
                                                        />
                                                    ) : (
                                                        <EmojiEvents sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.3 }} />
                                                    )}
                                                    <Lock
                                                        sx={{
                                                            position: 'absolute',
                                                            color: 'text.secondary',
                                                            fontSize: 32,
                                                        }}
                                                    />
                                                </Box>

                                                {/* Badge Info */}
                                                <Box sx={{ textAlign: 'center', width: '100%' }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.secondary' }}>
                                                        {badge.name}
                                                    </Typography>
                                                    <Chip
                                                        label={badge.tier}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                            color: 'text.secondary',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                            mb: 1,
                                                        }}
                                                    />
                                                    {badge.description && (
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 1 }}>
                                                            {badge.description}
                                                        </Typography>
                                                    )}
                                                    {/* Progress Bar */}
                                                    {badge.progress !== undefined && (
                                                        <Box sx={{ mt: 2 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    Progress
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    {badge.progress}%
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={badge.progress}
                                                                sx={{
                                                                    height: 6,
                                                                    borderRadius: 3,
                                                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: 'text.secondary',
                                                                    },
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default BadgeCollectionModal;
