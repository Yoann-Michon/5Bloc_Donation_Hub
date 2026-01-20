import { Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, Grid, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import { Close, EmojiEvents, Lock } from '@mui/icons-material';

interface Badge {
    id: number;
    name: string;
    tier: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    count: number;
    image: string;
    description?: string;
    unlocked: boolean;
    progress?: number; // For locked badges, show progress towards unlocking
}

interface BadgeCollectionModalProps {
    open: boolean;
    onClose: () => void;
    badges: Badge[];
}

const tierColors = {
    Common: '#9E9E9E',
    Rare: '#2196F3',
    Epic: '#9C27B0',
    Legendary: '#FF9800',
};

const tierGradients = {
    Common: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
    Rare: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    Epic: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
    Legendary: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
};

const BadgeCollectionModal = ({ open, onClose, badges }: BadgeCollectionModalProps) => {
    const unlockedBadges = badges.filter(b => b.unlocked);
    const lockedBadges = badges.filter(b => !b.unlocked);

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
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
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
                                <Grid item xs={12} sm={6} md={4} key={badge.id}>
                                    <Card
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: 3,
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                borderColor: tierColors[badge.tier],
                                                boxShadow: `0 8px 24px ${tierColors[badge.tier]}40`,
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
                                                background: tierGradients[badge.tier],
                                            }}
                                        />

                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                {/* Badge Image */}
                                                <Box
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative',
                                                        boxShadow: `0 4px 20px ${tierColors[badge.tier]}40`,
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={badge.image}
                                                        alt={badge.name}
                                                        sx={{ width: 60, height: 60, objectFit: 'contain' }}
                                                    />
                                                    {/* Count Badge */}
                                                    {badge.count > 1 && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: '50%',
                                                                bgcolor: 'primary.main',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '2px solid rgba(11, 0, 26, 1)',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                            }}
                                                        >
                                                            {badge.count}
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* Badge Info */}
                                                <Box sx={{ textAlign: 'center', width: '100%' }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                        {badge.name}
                                                    </Typography>
                                                    <Chip
                                                        label={badge.tier}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `${tierColors[badge.tier]}20`,
                                                            color: tierColors[badge.tier],
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                            mb: 1,
                                                        }}
                                                    />
                                                    {badge.description && (
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                                            {badge.description}
                                                        </Typography>
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

                {/* Locked Badges Section */}
                {lockedBadges.length > 0 && (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Lock sx={{ color: 'text.secondary' }} />
                            Locked Badges ({lockedBadges.length})
                        </Typography>
                        <Grid container spacing={3}>
                            {lockedBadges.map((badge) => (
                                <Grid item xs={12} sm={6} md={4} key={badge.id}>
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
                                                    <Box
                                                        component="img"
                                                        src={badge.image}
                                                        alt={badge.name}
                                                        sx={{ width: 60, height: 60, objectFit: 'contain', opacity: 0.3 }}
                                                    />
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

                {/* Empty State */}
                {badges.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <EmojiEvents sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                            No Badges Yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Start contributing to projects to earn your first badge!
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default BadgeCollectionModal;
