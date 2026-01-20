import { Box, Typography, Grid } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const stats = [
    {
        label: 'Total Donated',
        value: '42.5 ETH',
        change: '+12%',
        isPositive: true,
        gradient: 'linear-gradient(to right, #5227FF, transparent)', // Primary
    },
    {
        label: 'Impacted Projects',
        value: '128',
        change: '+5',
        isPositive: true,
        gradient: 'linear-gradient(to right, #00ff88, transparent)', // Emerald
    },
    {
        label: 'Gas Offset',
        value: '0.85 ETH',
        subtext: 'L2 Optimized',
        gradient: 'linear-gradient(to right, rgba(255, 255, 255, 0.2), transparent)', // White
    },
];

const DashboardStats = () => {
    return (
        <Grid container spacing={2} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                    <Box
                        sx={{
                            position: 'relative',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden',
                            height: '100%',
                        }}
                    >
                        <Typography variant="caption" sx={{ color: '#9d9db9', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1, display: 'block', fontSize: '0.75rem' }}>
                            {stat.label}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.25rem' }}>
                                {stat.value}
                            </Typography>

                            {stat.change && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#00ff88', fontWeight: 700, fontSize: '0.875rem' }}>
                                        <TrendingUp sx={{ fontSize: 12, mr: 0.25 }} />
                                        {stat.change}
                                    </Box>
                                </Box>
                            )}

                            {stat.subtext && (
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, fontSize: '0.75rem' }}>
                                    {stat.subtext}
                                </Typography>
                            )}
                        </Box>

                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: 4,
                                background: stat.gradient,
                                opacity: 0.3,
                            }}
                        />
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};

export default DashboardStats;
