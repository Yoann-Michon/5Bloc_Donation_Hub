import { Container, Typography, Grid, Box, CircularProgress, Button, Card, CardMedia, CardContent, Chip } from '@mui/material';
import { ShoppingCart, Refresh, Storefront } from '@mui/icons-material';
import { useMarketplace } from '../hooks/useMarketplace';
import { useWallet } from '../hooks/useWallet';
import { useToast } from '../context/ToastContext';

const Marketplace = () => {
    const { listings, isLoading, fetchListings, buyBadge, cancelListing } = useMarketplace();
    const { account } = useWallet();
    const { showToast } = useToast();

    const handleBuy = async (listingId: number, price: string) => {
        try {
            await buyBadge(listingId, price);
            showToast('Badge purchased successfully!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Purchase failed', 'error');
        }
    };

    const handleCancel = async (listingId: number) => {
        try {
            await cancelListing(listingId);
            showToast('Listing cancelled', 'success');
        } catch (error: any) {
            showToast(error.message || 'Cancellation failed', 'error');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Storefront sx={{ color: 'primary.main', fontSize: 40 }} />
                    Badge Marketplace
                </Typography>
                <Button
                    startIcon={<Refresh />}
                    onClick={fetchListings}
                    disabled={isLoading}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    Refresh
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : listings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4, border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Typography variant="h6" color="text.secondary">No badges for sale at the moment.</Typography>
                    <Typography variant="body2" color="text.secondary">Check back later or list your own badges!</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {listings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listingId}>
                            <Card sx={{
                                bgcolor: 'rgba(40, 40, 57, 0.4)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 4,
                                overflow: 'hidden',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-8px)', borderColor: 'primary.main' }
                            }}>
                                <Box sx={{ p: 2, pb: 0 }}>
                                    <Box sx={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        borderRadius: 3,
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        <Typography variant="h1" sx={{ opacity: 0.1, color: 'white' }}>#{listing.tokenId}</Typography>
                                    </Box>
                                </Box>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Badge #{listing.tokenId}</Typography>
                                        <Chip label={`${listing.price} ETH`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, fontFamily: 'monospace' }}>
                                        Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                                    </Typography>

                                    {account?.toLowerCase() === listing.seller.toLowerCase() ? (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleCancel(listing.listingId)}
                                            sx={{ borderRadius: 2, fontWeight: 700 }}
                                        >
                                            Cancel Listing
                                        </Button>
                                    ) : (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<ShoppingCart />}
                                            onClick={() => handleBuy(listing.listingId, listing.price)}
                                            sx={{ borderRadius: 2, fontWeight: 700 }}
                                        >
                                            Buy Now
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Marketplace;
