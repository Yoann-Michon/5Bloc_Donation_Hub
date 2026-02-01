import { Box, Typography, Button, IconButton } from '@mui/material';
import { Share } from '@mui/icons-material';

import { useNavigate, useLocation } from 'react-router-dom';

interface VortexProjectCardProps {
    id: number;
    title: string;
    description: string;
    image: string;
    category: string;
    raised: number;
    goal: number;
    daysLeft: number;
    badge?: 'Diamond' | 'Rare' | 'Epic' | 'Common' | 'New';
    badgeColor?: string;
    accentColor?: string;
}

const categoryConfig: Record<string, { color: string; icon: string }> = {
    Education: { color: '#3B82F6', icon: '📚' },
    Environment: { color: '#10B981', icon: '🌍' },
    Health: { color: '#EF4444', icon: '🏥' },
    DeFi: { color: '#F59E0B', icon: '💰' },
    Gaming: { color: '#8B5CF6', icon: '🎮' },
    Infrastructure: { color: '#6B7280', icon: '🏗️' },
    Uncategorized: { color: '#94A3B8', icon: '📁' },
};

const VortexProjectCard = ({
    id,
    title,
    description,
    image,
    category,
    raised,
    goal,
    daysLeft,
}: VortexProjectCardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const percentage = Math.min(100, Math.round((raised / goal) * 100));
    const config = categoryConfig[category] || categoryConfig.Uncategorized;

    const isDashboard = location.pathname.startsWith('/dashboard');
    const projectPath = isDashboard ? `/dashboard/projects/${id}` : `/projects/${id}`;

    return (
        <Box
            className="group"
            onClick={() => navigate(projectPath)}
            sx={{
                bgcolor: 'rgba(25, 24, 45, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2.5,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                overflow: 'hidden',
                '&:hover': {
                    boxShadow: '0 25px 50px -12px rgba(82, 39, 255, 0.1)',
                    transform: 'translateY(-4px)',
                }
            }}
        >
            {/* Image Section */}
            <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                <Box
                    component="img"
                    src={image}
                    alt={title}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        '.group:hover &': {
                            transform: 'scale(1.1)',
                        }
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(10, 10, 10, 0.8) 0%, transparent 100%)',
                    }}
                />
                {/* Rarity Badge */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 12.5,
                        bgcolor: 'rgba(54, 37, 244, 0.2)',
                        border: '1px solid rgba(54, 37, 244, 0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Box
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: config.color,
                        }}
                    />
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', color: 'white', textTransform: 'uppercase' }}>
                        {config.icon} {category}
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, transition: 'color 0.3s', '.group:hover &': { color: 'primary.main' } }}>
                        {title}
                    </Typography>
                    <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'white' } }}>
                        <Share fontSize="small" />
                    </IconButton>
                </Box>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6, fontSize: '0.875rem' }}>
                    {description}
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        <Box component="span" sx={{ color: 'text.secondary' }}>
                            Progress: <Box component="span" sx={{ color: 'white' }}>{percentage}%</Box>
                        </Box>
                        <Box component="span" sx={{ color: config.color, fontWeight: 700 }}>
                            {raised} / {goal} ETH
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, overflow: 'hidden' }}>
                        <Box
                            sx={{
                                width: `${percentage}%`,
                                height: '100%',
                                bgcolor: config.color,
                                borderRadius: 4,
                                boxShadow: `0 0 10px ${config.color}80`,
                                transition: 'width 1s ease-in-out'
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <Box>
                            <Typography sx={{ fontSize: '0.625rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '-0.02em', fontFamily: 'monospace' }}>
                                Ends In
                            </Typography>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'monospace' }}>
                                {daysLeft}d : 04h : 22m
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(projectPath);
                            }}
                            sx={{
                                bgcolor: config.color,
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                px: 3,
                                py: 1.5,
                                borderRadius: 1.5,
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    bgcolor: config.color,
                                    filter: 'brightness(1.1)',
                                }
                            }}
                        >
                            CONTRIBUTE
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default VortexProjectCard;
