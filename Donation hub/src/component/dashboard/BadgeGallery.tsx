import { Box, Typography, Button } from '@mui/material';
import { MilitaryTech, RocketLaunch, Forest, AccountBalance, Gavel } from '@mui/icons-material';
import { useState } from 'react';
import BadgeCollectionModal from '../modals/BadgeCollectionModal';

const badges = [
    {
        name: 'Early Supporter',
        tier: 'Rare NFT',
        icon: <RocketLaunch sx={{ fontSize: 40 }} />,
        color: '#5227FF',
    },
    {
        name: 'Carbon Neutral',
        tier: 'Legendary',
        icon: <Forest sx={{ fontSize: 40 }} />,
        color: '#00ff88',
    },
    {
        name: 'Genesis Donor',
        tier: 'Epic',
        icon: <AccountBalance sx={{ fontSize: 40 }} />,
        color: '#FFCC00',
    },
    {
        name: 'Governance Pro',
        tier: 'Common',
        icon: <Gavel sx={{ fontSize: 40 }} />,
        color: '#ffffff',
    },
];

const MOCK_BADGE_COLLECTION = [
    {
        id: 1,
        name: 'Early Supporter',
        tier: 'Rare' as const,
        count: 1,
        image: 'https://cdn-icons-png.flaticon.com/512/3214/3214746.png',
        description: 'Awarded to early platform supporters',
        unlocked: true,
    },
    {
        id: 2,
        name: 'Carbon Neutral',
        tier: 'Legendary' as const,
        count: 1,
        image: 'https://cdn-icons-png.flaticon.com/512/3233/3233496.png',
        description: 'Contributed to environmental projects',
        unlocked: true,
    },
    {
        id: 3,
        name: 'Genesis Donor',
        tier: 'Epic' as const,
        count: 1,
        image: 'https://cdn-icons-png.flaticon.com/512/2230/2230606.png',
        description: 'First 100 donors on the platform',
        unlocked: true,
    },
    {
        id: 4,
        name: 'Governance Pro',
        tier: 'Common' as const,
        count: 2,
        image: 'https://cdn-icons-png.flaticon.com/512/10459/10459635.png',
        description: 'Participated in 10+ governance votes',
        unlocked: true,
    },
    {
        id: 5,
        name: 'Mega Donor',
        tier: 'Legendary' as const,
        count: 0,
        image: 'https://cdn-icons-png.flaticon.com/512/3588/3588592.png',
        description: 'Donate over 10 ETH total',
        unlocked: false,
        progress: 65,
    },
    {
        id: 6,
        name: 'Community Leader',
        tier: 'Epic' as const,
        count: 0,
        image: 'https://cdn-icons-png.flaticon.com/512/3588/3588314.png',
        description: 'Refer 50+ users to the platform',
        unlocked: false,
        progress: 30,
    },
    {
        id: 7,
        name: 'Project Creator',
        tier: 'Rare' as const,
        count: 0,
        image: 'https://cdn-icons-png.flaticon.com/512/3588/3588435.png',
        description: 'Successfully fund a project',
        unlocked: false,
        progress: 0,
    },
    {
        id: 8,
        name: 'Streak Master',
        tier: 'Rare' as const,
        count: 0,
        image: 'https://cdn-icons-png.flaticon.com/512/3588/3588520.png',
        description: 'Donate for 30 consecutive days',
        unlocked: false,
        progress: 45,
    },
];

const BadgeGallery = () => {
    const [collectionOpen, setCollectionOpen] = useState(false);

    return (
        <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: 'Space Grotesk, sans-serif' }}>
                    <MilitaryTech sx={{ color: 'primary.main' }} />
                    My Badges Gallery
                </Typography>
                <Button
                    onClick={() => setCollectionOpen(true)}
                    sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'none' }}
                >
                    View All Collection
                </Button>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    gap: 3,
                    overflowX: 'auto',
                    pb: 2,
                    '::-webkit-scrollbar': { height: 4 },
                    '::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 },
                }}
            >
                {badges.map((badge, index) => (
                    <Box
                        key={index}
                        sx={{
                            flexShrink: 0,
                            width: 180,
                            perspective: '1000px',
                            cursor: 'pointer',
                            '&:hover .badge-card': {
                                transform: 'rotateY(15deg) rotateX(5deg) scale(1.05)',
                                borderColor: `${badge.color}80`,
                            }
                        }}
                        onClick={() => setCollectionOpen(true)}
                    >
                        <Box
                            className="badge-card"
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
                                bgcolor: 'rgba(40, 40, 57, 0.4)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.3s',
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    borderRadius: 2.5,
                                    mb: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    background: `linear-gradient(135deg, ${badge.color}33, ${badge.color}0d)`,
                                    color: badge.color,
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: 64,
                                        height: 64,
                                        bgcolor: badge.color,
                                        opacity: 0.3,
                                        filter: 'blur(20px)',
                                        borderRadius: '50%',
                                    }}
                                />
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    {badge.icon}
                                </Box>
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center', fontSize: '0.875rem' }}>
                                {badge.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: badge.color, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                {badge.tier}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            <BadgeCollectionModal
                open={collectionOpen}
                onClose={() => setCollectionOpen(false)}
                badges={MOCK_BADGE_COLLECTION}
            />
        </Box>
    );
};

export default BadgeGallery;
