import { Box, Typography, Grid, Avatar } from '@mui/material';
import { Done } from '@mui/icons-material';
import { BadgeTier } from '../../types/enums';

interface Badge {
    id: number;
    name: string;
    tier: BadgeTier;
    image: string;
    count: number;
}

interface BadgeSelectorProps {
    badges: Badge[];
    selectedBadges: Badge[];
    onSelect: (badge: Badge) => void;
    onDeselect: (badge: Badge) => void;
}

const tierColors: Record<BadgeTier, string> = {
    [BadgeTier.BRONZE]: '#cd7f32',
    [BadgeTier.SILVER]: '#c0c0c0',
    [BadgeTier.GOLD]: '#ffd700',
    [BadgeTier.LEGENDARY]: '#ff6b35',
};

const BadgeSelector = ({ badges, selectedBadges, onSelect, onDeselect }: BadgeSelectorProps) => {
    return (
        <Box
            sx={{
                bgcolor: 'rgba(25, 24, 45, 0.6)',
                backdropFilter: 'blur(12px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                p: 3,
                height: '100%',
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Your Badge Inventory
            </Typography>

            <Grid container spacing={2}>
                {badges.map((badge) => {
                    const isSelected = selectedBadges.some((b) => b.id === badge.id);
                    const isDisabled = selectedBadges.length >= 3 && !isSelected;

                    return (
                        <Grid size={{ xs: 6, md: 4 }} key={badge.id}>
                            <Box
                                onClick={() => !isDisabled && (isSelected ? onDeselect(badge) : onSelect(badge))}
                                sx={{
                                    position: 'relative',
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: isSelected ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                                    bgcolor: isSelected ? 'rgba(82, 39, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    opacity: isDisabled ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: isDisabled ? 'rgba(255, 255, 255, 0.1)' : 'primary.main',
                                        transform: isDisabled ? 'none' : 'translateY(-2px)',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <Avatar
                                        src={badge.image}
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            border: `2px solid ${tierColors[badge.tier]}`,
                                            boxShadow: isSelected ? `0 0 15px ${tierColors[badge.tier]}` : 'none',
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center', fontSize: '0.8rem' }}>
                                        {badge.name}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: tierColors[badge.tier],
                                            fontWeight: 700,
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {badge.tier}
                                    </Typography>
                                </Box>

                                {isSelected && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Done sx={{ fontSize: 14, color: 'white' }} />
                                    </Box>
                                )}

                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        px: 1,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
                                        x{badge.count}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default BadgeSelector;
