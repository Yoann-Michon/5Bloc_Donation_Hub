import { useState, useEffect } from 'react';
import { Box, Grid, Container, CircularProgress, Alert, Typography } from '@mui/material';
import BadgeSelector from '../component/fusion/BadgeSelector';
import FusionChamber from '../component/fusion/FusionChamber';
import { AutoFixHigh } from '@mui/icons-material';
import { useWallet } from '../hooks/useWallet';
import { BadgeTier } from '../types/enums';
import { fetchFromIPFS, getIPFSUrl, uploadMetadata } from '../utils/ipfs';

import type { Badge } from '../types/badge';

const BadgeFusion = () => {

    const { account, isConnected, getBadgeContract, user } = useWallet();


    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBadges, setSelectedBadges] = useState<Badge[]>([]);
    const [isFusing, setIsFusing] = useState(false);

    if (user && user.role !== 'USER') {
        return (
            <Container maxWidth="xl" sx={{ py: 10 }}>
                <Alert severity="warning">
                    La fusion de badges est réservée aux utilisateurs.
                </Alert>
            </Container>
        );
    }




    // Unified Metadata fetcher
    const getMetadata = async (tokenId: string, tokenURI: string): Promise<any> => {
        const hash = getIPFSUrl(tokenURI);

        let metadata: any = {
            name: `Badge #${tokenId}`,
            type: 'Bronze', // Default
            value: '0',
            hash: hash,
        };

        if (hash) {
            try {
                const json = await fetchFromIPFS(hash);
                if (json) {
                    metadata = { ...metadata, ...json };
                }
            } catch (error) {
                console.error('Failed to fetch IPFS metadata:', error);
            }
        }
        return metadata;
    };

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

            const tokenIds = await contract.getTokensByOwner(account);
            const badgesArray: Badge[] = [];

            for (const tokenId of tokenIds) {
                const tokenIdNum = Number(tokenId);
                const tokenIdStr = tokenId.toString();

                try {
                    const tokenURI = await contract.tokenURI(tokenId);
                    const metadata = await getMetadata(tokenIdStr, tokenURI);

                    // Map metadata type to BadgeTier enum
                    let tier: BadgeTier;
                    const metadataType = (metadata.type || 'Bronze').toLowerCase();

                    if (metadataType === 'gold') tier = BadgeTier.GOLD;
                    else if (metadataType === 'silver') tier = BadgeTier.SILVER;
                    else if (metadataType === 'diamond') tier = BadgeTier.DIAMOND;
                    else tier = BadgeTier.BRONZE;

                    badgesArray.push({
                        id: tokenIdNum,
                        name: metadata.name || `Badge #${tokenIdNum}`,
                        tier,
                        count: 1,
                        image: metadata.image || `/badges/${tier.toLowerCase()}.png`,
                    });
                } catch (err) {
                    console.error(`Failed to load badge ${tokenIdNum}:`, err);
                }
            }

            setBadges(badgesArray);
            setError(null);
        } catch (err: any) {
            console.error('Failed to load badges:', err);

            if (err.code === 'BAD_DATA' || err.message?.includes('could not decode result data')) {
                setError('Badge contract not deployed or not accessible. Please ensure the blockchain is running and contracts are deployed.');
            } else {
                setError('Failed to load badges from blockchain');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBadges();
    }, [account, isConnected, getBadgeContract]);


    const handleSelect = (badge: Badge) => {
        if (selectedBadges.length < 2) {
            const isAlreadySelected = selectedBadges.some(b => b.id === badge.id);
            if (!isAlreadySelected) {
                setSelectedBadges([...selectedBadges, badge]);
            } else {
                alert("This badge is already selected!");
            }
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

    const handleFuse = async () => {
        if (!canFuse || selectedBadges.length !== 2) return;

        setIsFusing(true);
        try {
            const contract = getBadgeContract();
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            const tokenId1 = selectedBadges[0].id;
            const tokenId2 = selectedBadges[1].id;

            const TIER_ORDER = [BadgeTier.BRONZE, BadgeTier.SILVER, BadgeTier.GOLD, BadgeTier.DIAMOND];
            const currentTierIndex = TIER_ORDER.indexOf(selectedBadges[0].tier);
            const nextTierIndex = currentTierIndex + 1;

            // Map Enum values to display names
            const tierDisplayNames: Record<BadgeTier, string> = {
                [BadgeTier.BRONZE]: 'Bronze',
                [BadgeTier.SILVER]: 'Silver',
                [BadgeTier.GOLD]: 'Gold',
                [BadgeTier.DIAMOND]: 'Diamond',
            };

            const nextTierEnum = TIER_ORDER[nextTierIndex];
            const nextTierName = nextTierEnum ? tierDisplayNames[nextTierEnum] : 'Unknown';
            const currentTierName = tierDisplayNames[selectedBadges[0].tier] || 'Unknown';

            const BADGE_IMAGES: Record<string, string> = {
                Bronze: 'https://img.freepik.com/vecteurs-premium/medaille-bronze-realiste-rubans-rouges-coupe-du-gagnant-gravee-badge-premium-pour-gagnants-realisations_88188-4035.jpg',
                Silver: 'https://img.freepik.com/vecteurs-premium/medaille-argent-realiste-rubans-rouges-coupe-du-gagnant-gravee-badge-premium-pour-gagnants-realisations_88188-4037.jpg',
                Gold: 'https://img.freepik.com/vecteurs-premium/medaille-or-realiste-rubans-rouges-coupe-du-vainqueur-gravee-badge-premium-pour-gagnants-realisations_88188-4043.jpg?w=996',
                Diamond: 'https://placehold.co/200/00E5FF/FFFFFF/png?text=Diamond+Badge',
                Unknown: 'https://placehold.co/200/808080/FFFFFF/png?text=Badge'
            };

            const imageUrl = BADGE_IMAGES[nextTierName] || BADGE_IMAGES.Unknown;
            const nowTimestamp = Math.floor(Date.now() / 1000);

            const metadata = {
                name: `Fused ${nextTierName} Badge`,
                type: nextTierName,
                description: `A powerful ${nextTierName} badge created by fusing two ${currentTierName} badges.`,
                image: imageUrl,
                value: 'Fusion',
                attributes: [
                    { trait_type: 'Tier', value: nextTierName },
                    { trait_type: 'Method', value: 'Fusion' },
                    { trait_type: 'Parents', value: `#${tokenId1}, #${tokenId2}` }
                ],
                hash: "",
                previousOwners: [],
                createdAt: nowTimestamp,
                lastTransferAt: nowTimestamp,
                minter: account
            };

            const newMetadataURI = await uploadMetadata(metadata);

            const tx = await contract.fuseBadges(tokenId1, tokenId2, newMetadataURI);
            await tx.wait();

            const { syncUserBadges } = await import('../utils/api');
            await syncUserBadges(account);

            // Refetch badges to update UI
            await fetchBadges();

            setSelectedBadges([]);
            alert('Fusion Successful! You crafted a higher tier badge!');
        } catch (err: any) {
            console.error('Fusion failed:', err);
            alert(`Fusion failed: ${err.message || 'Unknown error'}`);
        } finally {
            setIsFusing(false);
        }
    };


    const slots = [
        selectedBadges[0] || null,
        selectedBadges[1] || null,
    ];

    const canFuse = selectedBadges.length === 2 && selectedBadges.every(b => b.tier === selectedBadges[0].tier);


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


    if (!isConnected) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="info">
                    Please connect your wallet to view and fuse your badges.
                </Alert>
            </Container>
        );
    }


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
