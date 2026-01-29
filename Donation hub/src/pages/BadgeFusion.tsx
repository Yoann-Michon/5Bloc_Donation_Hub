import { useState, useEffect } from 'react';
import { Box, Grid, Container, CircularProgress, Alert, Typography } from '@mui/material';
import BadgeSelector from '../component/fusion/BadgeSelector';
import FusionChamber from '../component/fusion/FusionChamber';
import { AutoFixHigh } from '@mui/icons-material';
import { useWallet } from '../hooks/useWallet';
import { BadgeTier } from '../types/enums';

interface Badge {
    id: number;
    name: string;
    tier: BadgeTier;
    count: number;
    image: string;
}

const BadgeFusion = () => {
    // Wallet connection
    const { account, isConnected, getBadgeContract } = useWallet();

    // State
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBadges, setSelectedBadges] = useState<Badge[]>([]);
    const [isFusing, setIsFusing] = useState(false);

    // Fetch user's badges from blockchain
    useEffect(() => {
        const fetchBadges = async () => {
            if (!account || !isConnected) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const contract = getBadgeContract();
                if (!contract) {
                    throw new Error('Contract not initialized');
                }

                // For now, we'll show a message that this feature is coming soon
                // In the future, we would fetch each badge's metadata from IPFS
                setBadges([]);
                setError(null);
            } catch (err) {
                setError('Failed to load badges from blockchain');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBadges();
    }, [account, isConnected, getBadgeContract]);

    // Handlers
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

    // Logic
    const slots = [
        selectedBadges[0] || null,
        selectedBadges[1] || null,
    ];

    const canFuse = selectedBadges.length === 2 && selectedBadges.every(b => b.tier === selectedBadges[0].tier);

    // Loading state
    if (isLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        Loading your badges...
                    </Typography>
                </Box>
            </Container>
        );
    }

    // Not connected state
    if (!isConnected) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="info">
                    Please connect your wallet to view and fuse your badges.
                </Alert>
            </Container>
        );
    }

    // Error state
    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

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

            {badges.length === 0 ? (
                <Alert severity="info" sx={{ mb: 4 }}>
                    You don't have any badges yet. Make donations to projects to earn badges!
                </Alert>
            ) : (
                <Grid container spacing={4} sx={{ height: 'calc(100vh - 200px)' }}>
                    {/* Fusion Chamber (Left/Top) */}
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <FusionChamber
                            slots={slots}
                            onRemove={handleRemoveSlot}
                            onFuse={handleFuse}
                            isFusing={isFusing}
                            canFuse={canFuse}
                        />
                    </Grid>

                    {/* Badge Inventory (Right/Bottom) */}
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <BadgeSelector
                            badges={badges}
                            selectedBadges={selectedBadges}
                            onSelect={handleSelect}
                            onDeselect={handleDeselect}
                        />
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default BadgeFusion;
