import { useState } from 'react';
import { Box, Grid, Container } from '@mui/material';
import BadgeSelector from '../component/fusion/BadgeSelector';
import FusionChamber from '../component/fusion/FusionChamber';
import { AutoFixHigh } from '@mui/icons-material';

const MOCK_BADGES = [
    { id: 1, name: 'Eco Starter', tier: 'Common', count: 5, image: 'https://cdn-icons-png.flaticon.com/512/3214/3214746.png' },
    { id: 2, name: 'Governance Novice', tier: 'Common', count: 3, image: 'https://cdn-icons-png.flaticon.com/512/2230/2230606.png' },
    { id: 3, name: 'DeFi Explorer', tier: 'Common', count: 4, image: 'https://cdn-icons-png.flaticon.com/512/10459/10459635.png' },
    { id: 4, name: 'Forest Guardian', tier: 'Rare', count: 2, image: 'https://cdn-icons-png.flaticon.com/512/3233/3233496.png' },
] as const;

type Badge = typeof MOCK_BADGES[number];

const BadgeFusion = () => {

    const [selectedBadges, setSelectedBadges] = useState<Badge[]>([]);
    const [isFusing, setIsFusing] = useState(false);

    const handleSelect = (badge: Badge) => {
        if (selectedBadges.length < 2) {
            setSelectedBadges([...selectedBadges, badge]);
        }
    };

    const handleDeselect = (badge: Badge) => {
        const index = selectedBadges.findIndex((b) => b.id === badge.id);
        if (index > -1) {
            const newSelected = [...selectedBadges];
            newSelected.splice(index, 1);
            setSelectedBadges(newSelected);
        }
    };

    const handleRemoveSlot = (index: number) => {
        const newSelected = [...selectedBadges];
        newSelected.splice(index, 1);
        setSelectedBadges(newSelected);
    };

    const handleFuse = () => {
        setIsFusing(true);
        setTimeout(() => {
            setIsFusing(false);
            setSelectedBadges([]);
            alert('Fusion Successful! You crafted a Rare Badge!');
        }, 3000);
    };

    const slots = [
        selectedBadges[0] || null,
        selectedBadges[1] || null,
    ];

    const canFuse = selectedBadges.length === 2 && selectedBadges.every(b => b.tier === selectedBadges[0].tier);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    <AutoFixHigh sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold font-space text-white">Badge Fusion</h1>
                    <p className="text-gray-400">Combine generic badges to craft higher-tier NFTs.</p>
                </div>
            </Box>

            <Grid container spacing={4} sx={{ height: 'calc(100vh - 200px)' }}>

                <Grid size={{ xs: 12, lg: 7 }}>
                    <FusionChamber
                        slots={slots}
                        onRemove={handleRemoveSlot}
                        onFuse={handleFuse}
                        isFusing={isFusing}
                        canFuse={canFuse}
                    />
                </Grid>


                <Grid size={{ xs: 12, lg: 5 }}>
                    <BadgeSelector
                        badges={MOCK_BADGES as unknown as Badge[]}
                        selectedBadges={selectedBadges}
                        onSelect={(b) => handleSelect(b as Badge)}
                        onDeselect={(b) => handleDeselect(b as Badge)}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default BadgeFusion;
