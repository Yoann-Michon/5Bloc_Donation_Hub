import { Box, Typography, Button, Skeleton, Tooltip } from '@mui/material';
import { MilitaryTech, RocketLaunch, Forest, AccountBalance, Refresh, OpenInNew } from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import BadgeCollectionModal from '../modals/BadgeCollectionModal';
import { useWallet } from '../../hooks/useWallet';

// Badge interface matching the component structure + Metadata fields
export interface Badge {
    id: number | string;
    name: string;
    tier: string;
    icon?: React.ReactElement;
    color: string;
    image?: string;
    description?: string;
    // Metadata fields
    hash?: string;
    type?: string;
    createdAt?: string;
    previousOwners?: string[];
    value?: string;
}

const BadgeGallery = () => {
    const [collectionOpen, setCollectionOpen] = useState(false);
    const { account, isConnected, getBadgeContract } = useWallet();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBadges = useCallback(async () => {
        if (!account) return;

        setLoading(true);
        try {
            const contract = getBadgeContract();
            if (!contract) return;
            
            // Query Transfer events to find tokens owned by the user
            const filter = contract.filters.Transfer(null, account);
            const events = await contract.queryFilter(filter);

            const fetchedBadges: Badge[] = [];

            // We iterate over events to find ALL tokens ever transferred to user
            // In a production app, we would verify current ownership with ownerOf(tokenId)
            // But for this demo, we assume incoming transfer usually means ownership unless burned/sent away
            // To be safer, we can check ownerOf for each found ID.
            
            // Deduplicate token IDs from events
            const tokenIds = Array.from(new Set(events.map(e => (e as any).args[2].toString())));

            for (const tokenId of tokenIds) {
                try {
                    // Check if user still owns it
                    const owner = await contract.ownerOf(tokenId);
                    if (owner.toLowerCase() !== account.toLowerCase()) continue;

                    const tokenURI = await contract.tokenURI(tokenId);
                    
                    let metadata: any = { name: `Badge #${tokenId}`, type: 'Unknown', value: '0' };
                    
                    if (tokenURI.startsWith('ipfs://')) {
                         // Real IPFS fetch would go here using gateway
                         // const cid = tokenURI.replace('ipfs://', '');
                         // const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
                         // metadata = await response.json();

                         // SIMULATION: 
                         // Check if it's one of our "mock" URIs we generated in DonationModal
                         // The format was `ipfs://Qm...MOCK` 
                         // Since we can't actually fetch it, we will simulate the metadata based on the request requirements
                         // In a real app, this metadata COMES from the JSON.
                         
                         console.log(`Fetching metadata for ${tokenURI}`);
                         
                         // Mocking the result of "fetch(tokenURI)"
                         metadata = {
                            name: `Donation Project #${tokenId}`,
                            type: 'Gold', // dynamic fallback
                            value: '1.5',
                            hash: tokenURI.replace('ipfs://', ''),
                            previousOwners: [],
                            createdAt: new Date().toISOString()
                         };
                         
                         // Try to intuit 'Silver'/'Bronze' from some randomness or just default
                         if (Number(tokenId) % 2 === 0) metadata.type = 'Silver';
                    }

                    // Map Tier to Icon/Color
                    let tierConfig = { icon: <RocketLaunch sx={{ fontSize: 48 }} />, color: '#CD7F32' }; // Bronze default
                    
                    if (metadata.type === 'Gold') {
                         tierConfig = { icon: <RocketLaunch sx={{ fontSize: 48 }} />, color: '#FFCC00' };
                    } else if (metadata.type === 'Silver') {
                         tierConfig = { icon: <AccountBalance sx={{ fontSize: 48 }} />, color: '#C0C0C0' }; // Silver
                    } else if (metadata.type === 'Bronze') {
                         tierConfig = { icon: <Forest sx={{ fontSize: 48 }} />, color: '#CD7F32' }; // Bronze
                    }

                    fetchedBadges.push({
                        id: tokenId.toString(),
                        name: metadata.name,
                        tier: metadata.type || 'Common',
                        icon: tierConfig.icon,
                        color: tierConfig.color,
                        description: `Donation: ${metadata.value || '?'} ETH`,
                        hash: metadata.hash,
                        type: metadata.type,
                        createdAt: metadata.createdAt,
                        previousOwners: metadata.previousOwners,
                        value: metadata.value
                    });

                } catch (err) {
                    console.error(`Error fetching data for token ${tokenId}`, err);
                }
            }
            
            setBadges(fetchedBadges);

        } catch (error) {
            console.error("Error fetching badges", error);
        } finally {
            setLoading(false);
        }
    }, [account, getBadgeContract]);

    useEffect(() => {
        if (isConnected && account) {
            fetchBadges();
        } else {
            setBadges([]);
        }
    }, [isConnected, account, fetchBadges]);


    // Data for the modal
    const COLLECTION_VIEW = badges.map(b => ({
         id: Number(b.id),
         name: b.name,
         tier: b.tier as any,
         count: 1,
         image: '', 
         description: b.description || '',
         unlocked: true,
         // Pass through metadata for the modal to display
         hash: b.hash,
         type: b.type,
         createdAt: b.createdAt,
         previousOwners: b.previousOwners,
         value: b.value
    }));

    const openIPFS = (e: React.MouseEvent, hash?: string) => {
        e.stopPropagation();
        if (hash) {
            window.open(`https://ipfs.io/ipfs/${hash}`, '_blank');
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
                    {[1,2,3].map(i => (
                        <Skeleton key={i} variant="rectangular" width={200} height={200} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                    ))}
                 </Box>
            ) : badges.length === 0 ? (
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
                    {badges.map((badge, index) => (
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
                            onClick={() => setCollectionOpen(true)}
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
                                
                                {badge.hash && (
                                    <Tooltip title="View on IPFS">
                                        <Button 
                                            size="small" 
                                            onClick={(e) => openIPFS(e, badge.hash)}
                                            startIcon={<OpenInNew sx={{ fontSize: 12 }} />}
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
                                    </Tooltip>
                                )}
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
        </Box>
    );
};

export default BadgeGallery;
