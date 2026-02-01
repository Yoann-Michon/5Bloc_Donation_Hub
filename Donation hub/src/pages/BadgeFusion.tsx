import { useState, useEffect } from 'react';
import { Box, Grid, Container, CircularProgress, Alert, Typography } from '@mui/material';
import BadgeSelector from '../component/fusion/BadgeSelector';
import FusionChamber from '../component/fusion/FusionChamber';
import { AutoFixHigh } from '@mui/icons-material';
import { useWallet } from '../hooks/useWallet';
import { BadgeTier } from '../types/enums';

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

                const tokenIds = await contract.getTokensByOwner(account);
                const badgesArray: Badge[] = [];

                // Helper function to get metadata (same as dashboard)
                const getMetadata = async (tokenId: string, tokenURI: string): Promise<any> => {
                    let hash = '';
                    if (tokenURI.startsWith('ipfs://')) {
                        hash = tokenURI.replace('ipfs://', '');
                    }

                    let metadata: any = {
                        name: `Badge #${tokenId}`,
                        type: 'Bronze', // Default
                        value: '0',
                        hash: hash,
                    };

                    if (hash) {
                        // Try localStorage first
                        const localData = localStorage.getItem(hash);
                        if (localData) {
                            try {
                                const json = JSON.parse(localData);
                                metadata = { ...metadata, ...json };
                            } catch (e) {
                                console.error('Failed to parse local metadata:', e);
                            }
                        } else {
                            // Try IPFS
                            try {
                                const controller = new AbortController();
                                const timeoutId = setTimeout(() => controller.abort(), 3000);
                                const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`, { signal: controller.signal });
                                clearTimeout(timeoutId);

                                if (response.ok) {
                                    const json = await response.json();
                                    metadata = { ...metadata, ...json };
                                    // Cache it
                                    localStorage.setItem(hash, JSON.stringify(json));
                                }
                            } catch (ipfsError) {
                                console.error('Failed to fetch IPFS metadata:', ipfsError);
                            }
                        }
                    }

                    return metadata;
                };

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
                        else if (metadataType === 'legendary') tier = BadgeTier.LEGENDARY;
                        else tier = BadgeTier.BRONZE;

                        badgesArray.push({
                            id: tokenIdNum,
                            name: metadata.name || `Badge #${tokenIdNum}`,
                            tier,
                            count: 1,
                            image: `/badges/${tier.toLowerCase()}.png`,
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

        fetchBadges();
    }, [account, isConnected, getBadgeContract]);


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

    const handleFuse = async () => {
        if (!canFuse || selectedBadges.length !== 2) return;

        setIsFusing(true);
        try {
            const contract = getBadgeContract();
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            const badge1 = selectedBadges[0];
            const badge2 = selectedBadges[1];


            const allTokenIds = await contract.getTokensByOwner(account);
            const tokenIdsOfTier: number[] = [];

            for (const tokenId of allTokenIds) {
                const tokenIdNum = Number(tokenId);
                let tier: BadgeTier;

                if (tokenIdNum < 100) tier = BadgeTier.BRONZE;
                else if (tokenIdNum < 500) tier = BadgeTier.SILVER;
                else if (tokenIdNum < 1000) tier = BadgeTier.GOLD;
                else tier = BadgeTier.LEGENDARY;

                if (tier === badge1.tier) {
                    tokenIdsOfTier.push(tokenIdNum);
                }
            }

            if (tokenIdsOfTier.length < 2) {
                throw new Error('Not enough badges of this tier');
            }

            const tokenId1 = tokenIdsOfTier[0];
            const tokenId2 = tokenIdsOfTier[1];


            const newMetadataURI = `ipfs://QmNewBadge${Date.now()}`;


            const tx = await contract.fuseBadges(tokenId1, tokenId2, newMetadataURI);


            await tx.wait();


            const { syncUserBadges } = await import('../utils/api');
            await syncUserBadges(account);

            const updatedTokenIds = await contract.getTokensByOwner(account);
            const badgesArray: Badge[] = [];

            // Helper function to get metadata (same as initial load)
            const getMetadata = async (tokenId: string, tokenURI: string): Promise<any> => {
                let hash = '';
                if (tokenURI.startsWith('ipfs://')) {
                    hash = tokenURI.replace('ipfs://', '');
                }

                let metadata: any = {
                    name: `Badge #${tokenId}`,
                    type: 'Bronze',
                    value: '0',
                    hash: hash,
                };

                if (hash) {
                    const localData = localStorage.getItem(hash);
                    if (localData) {
                        try {
                            const json = JSON.parse(localData);
                            metadata = { ...metadata, ...json };
                        } catch (e) {
                            console.error('Failed to parse local metadata:', e);
                        }
                    } else {
                        try {
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 3000);
                            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`, { signal: controller.signal });
                            clearTimeout(timeoutId);

                            if (response.ok) {
                                const json = await response.json();
                                metadata = { ...metadata, ...json };
                                localStorage.setItem(hash, JSON.stringify(json));
                            }
                        } catch (ipfsError) {
                            console.error('Failed to fetch IPFS metadata:', ipfsError);
                        }
                    }
                }

                return metadata;
            };

            for (const tokenId of updatedTokenIds) {
                const tokenIdNum = Number(tokenId);
                const tokenIdStr = tokenId.toString();

                try {
                    const tokenURI = await contract.tokenURI(tokenId);
                    const metadata = await getMetadata(tokenIdStr, tokenURI);

                    let tier: BadgeTier;
                    const metadataType = (metadata.type || 'Bronze').toLowerCase();

                    if (metadataType === 'gold') tier = BadgeTier.GOLD;
                    else if (metadataType === 'silver') tier = BadgeTier.SILVER;
                    else if (metadataType === 'legendary') tier = BadgeTier.LEGENDARY;
                    else tier = BadgeTier.BRONZE;

                    badgesArray.push({
                        id: tokenIdNum,
                        name: metadata.name || `Badge #${tokenIdNum}`,
                        tier,
                        count: 1,
                        image: `/badges/${tier.toLowerCase()}.png`,
                    });
                } catch (err) {
                    console.error(`Failed to reload badge ${tokenIdNum}:`, err);
                }
            }

            setBadges(badgesArray);
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
