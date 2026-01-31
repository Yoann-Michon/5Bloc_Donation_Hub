import { Box, Typography, Button, Skeleton, Tooltip } from '@mui/material';
import { MilitaryTech, RocketLaunch, Forest, AccountBalance, Refresh, OpenInNew } from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import BadgeCollectionModal from '../modals/BadgeCollectionModal';
import BadgeDetailsModal from '../modals/BadgeDetailsModal';
import { useWallet } from '../../hooks/useWallet';

export interface Badge {
    id: number | string;
    name: string;
    tier: string;
    icon?: React.ReactElement;
    color: string;
    image?: string;
    description?: string;
    hash?: string;
    type?: string;
    createdAt?: string;
    previousOwners?: string[];
    value?: string;
}

const DEFAULT_IMAGES = {
    Bronze: 'https://img.freepik.com/vecteurs-premium/medaille-bronze-realiste-rubans-rouges-coupe-du-gagnant-gravee-badge-premium-pour-gagnants-realisations_88188-4035.jpg',
    Silver: 'https://img.freepik.com/vecteurs-premium/medaille-argent-realiste-rubans-rouges-coupe-du-gagnant-gravee-badge-premium-pour-gagnants-realisations_88188-4037.jpg',
    Gold: 'https://img.freepik.com/vecteurs-premium/medaille-or-realiste-rubans-rouges-coupe-du-vainqueur-gravee-badge-premium-pour-gagnants-realisations_88188-4043.jpg?w=996',
    Unknown: 'https://placehold.co/200/808080/FFFFFF/png?text=Badge'
};

const getMetadata = async (tokenId: string, tokenURI: string): Promise<any> => {
    let hash = '';
    if (tokenURI.startsWith('ipfs://')) {
        hash = tokenURI.replace('ipfs://', '');
    }

    let metadata: any = {
        name: `Badge #${tokenId}`,
        type: 'Unknown',
        value: '0',
        hash: hash,
        image: DEFAULT_IMAGES.Unknown,
        description: hash ? `Metadata unavailable. IPFS Hash: ${hash}` : undefined
    };

    if (hash) {
        const localData = localStorage.getItem(hash);

        if (localData) {
            try {
                const json = JSON.parse(localData);
                metadata = {
                    ...metadata,
                    ...json,
                    name: json.name || metadata.name,
                    image: json.image || DEFAULT_IMAGES[json.type as keyof typeof DEFAULT_IMAGES] || metadata.image,
                    hash: hash
                };
            } catch (e) {
            }
        } else {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const json = await response.json();
                    metadata = {
                        ...metadata,
                        ...json,
                        name: json.name || metadata.name,
                        image: json.image || DEFAULT_IMAGES[json.type as keyof typeof DEFAULT_IMAGES] || metadata.image,
                        description: json.description || metadata.description,
                        hash: hash
                    };
                }
            } catch (ipfsError) {
            }
        }
    }

    return metadata;
};

const BadgeGallery = () => {
    const [collectionOpen, setCollectionOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const { account, isConnected, getBadgeContract } = useWallet();
    const [realBadges, setRealBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBadges = useCallback(async () => {
        if (!account) return;

        setLoading(true);
        try {
            const contract = getBadgeContract();
            if (!contract) return;

            const tokenIds = await contract.getTokensByOwner(account);

            const fetchedBadges: Badge[] = [];

            for (const tokenId of tokenIds) {
                try {
                    const tokenIdStr = tokenId.toString();
                    const tokenURI = await contract.tokenURI(tokenId);
                    const metadata = await getMetadata(tokenIdStr, tokenURI);

                    let tierConfig = { icon: <RocketLaunch sx={{ fontSize: 48 }} />, color: '#CD7F32' };

                    if (metadata.type === 'Gold') {
                        tierConfig = { icon: <RocketLaunch sx={{ fontSize: 48 }} />, color: '#FFCC00' };
                    } else if (metadata.type === 'Silver') {
                        tierConfig = { icon: <AccountBalance sx={{ fontSize: 48 }} />, color: '#C0C0C0' };
                    } else if (metadata.type === 'Bronze') {
                        tierConfig = { icon: <Forest sx={{ fontSize: 48 }} />, color: '#CD7F32' };
                    } else {
                        tierConfig = { icon: <MilitaryTech sx={{ fontSize: 48 }} />, color: '#808080' };
                    }

                    fetchedBadges.push({
                        id: tokenIdStr,
                        name: metadata.name,
                        tier: metadata.type || 'Common',
                        icon: tierConfig.icon,
                        color: tierConfig.color,
                        image: metadata.image,
                        description: metadata.description || `Donation: ${metadata.value || '?'} ETH`,
                        hash: metadata.hash,
                        type: metadata.type,
                        createdAt: metadata.createdAt,
                        previousOwners: metadata.previousOwners,
                        value: metadata.value
                    });

                } catch (err) {
                }
            }

            setRealBadges(fetchedBadges);

        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [account, getBadgeContract]);

    useEffect(() => {
        if (isConnected && account) {
            fetchBadges();
        } else {
            setRealBadges([]);
        }
    }, [isConnected, account, fetchBadges]);


    const COLLECTION_VIEW = realBadges.map(b => ({
        id: Number(b.id),
        name: b.name,
        tier: b.tier as any,
        count: 1,
        image: b.image || '',
        description: b.description || '',
        unlocked: true,
        hash: b.hash,
        type: b.type,
        createdAt: b.createdAt,
        previousOwners: b.previousOwners,
        value: b.value
    }));

    const openIPFS = (e: React.MouseEvent, hash?: string) => {
        e.stopPropagation();
        if (hash) {
            window.open(`https://gateway.pinata.cloud/ipfs/${hash}`, '_blank');
        }
    };

    return (
        <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: 'Space Grotesk, sans-serif' }}>
                    <MilitaryTech sx={{ color: 'primary.main' }} />
                    My Badges Gallery
                </Typography>
                <Box>
                    <Button onClick={fetchBadges} disabled={loading} startIcon={<Refresh />}>
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setCollectionOpen(true)}
                        sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'none', ml: 1 }}
                    >
                        View Details
                    </Button>
                </Box>
            </Box>

            {!isConnected ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <Typography>Connect wallet to view your badges</Typography>
                </Box>
            ) : loading ? (
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} variant="rectangular" width={200} height={200} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                    ))}
                </Box>
            ) : realBadges.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <Typography>No badges found. Donate to earn your first badge!</Typography>
                </Box>
            ) : (
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
                    {realBadges.map((badge, index) => (
                        <Box
                            key={index}
                            sx={{
                                flexShrink: 0,
                                width: 200,
                                perspective: '1000px',
                                cursor: 'pointer',
                                '&:hover .badge-card': {
                                    transform: 'rotateY(15deg) rotateX(5deg) scale(1.05)',
                                    borderColor: `${badge.color}80`,
                                }
                            }}
                            onClick={() => {
                                setSelectedBadge(badge);
                                setDetailsOpen(true);
                            }}
                        >
                            <Box
                                className="badge-card"
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(40, 40, 57, 0.4)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.3s',
                                    transformStyle: 'preserve-3d',
                                    position: 'relative'
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        borderRadius: 2,
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
                                <Typography variant="caption" sx={{ color: badge.color, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1 }}>
                                    {badge.tier}
                                </Typography>

                                <Tooltip title={badge.hash ? "View on IPFS" : "No IPFS Hash"}>
                                    <span>
                                        <Button
                                            size="small"
                                            onClick={(e) => openIPFS(e, badge.hash)}
                                            startIcon={<OpenInNew sx={{ fontSize: 12 }} />}
                                            disabled={!badge.hash}
                                            sx={{
                                                minWidth: 0,
                                                p: 0.5,
                                                fontSize: '0.6rem',
                                                color: 'text.secondary',
                                                '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                                            }}
                                        >
                                            IPFS
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            <BadgeCollectionModal
                open={collectionOpen}
                onClose={() => setCollectionOpen(false)}
                badges={COLLECTION_VIEW.length > 0 ? COLLECTION_VIEW : []}
            />

            <BadgeDetailsModal
                open={detailsOpen}
                onClose={() => {
                    setDetailsOpen(false);
                    setSelectedBadge(null);
                }}
                badge={selectedBadge}
            />
        </Box>
    );
};

export default BadgeGallery;
