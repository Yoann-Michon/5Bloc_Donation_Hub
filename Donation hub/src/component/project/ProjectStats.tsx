import { Box, Typography, Grid } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const stats = [
    {
        label: 'Total Value Locked',
        value: '1,240.5',
        unit: 'ETH',
        change: '+12.4%',
        changeLabel: 'from last month',
        glowColor: 'rgba(82, 39, 255, 0.4)',
        blurColor: 'rgba(82, 39, 255, 0.2)',
    },
    {
        label: 'Active Projects',
        value: '842',
        unit: '',
        change: '+5.2%',
        changeLabel: 'live pools',
        glowColor: 'rgba(99, 102, 241, 0.4)',
        blurColor: 'rgba(99, 102, 241, 0.2)',
    },
    {
        label: 'Unique Donors',
        value: '12,584',
        unit: '',
        change: '+8.1%',
        changeLabel: 'global wallets',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        blurColor: 'rgba(168, 85, 247, 0.2)',
    },
];

const ProjectStats = () => {
    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                    <Box
                        className="group"
                        sx={{
                            position: 'relative',
                            p: 3,
                            borderRadius: 2,
                            bgcolor: 'rgba(25, 24, 45, 0.6)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            height: '100%',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                            }
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                right: -16,
                                bottom: -16,
                                width: 96,
                                height: 96,
                                borderRadius: '50%',
                                bgcolor: stat.glowColor,
                                opacity: 0.1,
                                filter: 'blur(32px)',
                                transition: 'all 0.3s ease',
                                '.group:hover &': {
                                    opacity: 0.2,
                                    transform: 'scale(1.2)',
                                }
                            }}
                        />

                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500, fontSize: '0.75rem' }}>
                                {stat.label}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.5rem' }}>
                                        {stat.value}
                                    </Typography>
                                    {stat.unit && (
                                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.75rem' }}>
                                            {stat.unit}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', color: '#10b981', fontWeight: 700, fontSize: '0.875rem' }}>
                                        <TrendingUp sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                                        {stat.change}
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem' }}>
                                        {stat.changeLabel}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};

export default ProjectStats;
