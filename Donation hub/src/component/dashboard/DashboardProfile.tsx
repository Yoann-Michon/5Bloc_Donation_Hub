import { Box, Typography, Button, Avatar, Chip } from '@mui/material';
import { Share, VolunteerActivism, CalendarToday, Verified, WorkspacePremium } from '@mui/icons-material';
import { useWallet } from '../../hooks/useWallet';

const DashboardProfile = () => {
    const { account } = useWallet();

    return (
        <Box
            sx={{
                position: 'relative',
                p: { xs: 2, md: 3 },
                mb: 3,
                borderRadius: 2,
                bgcolor: 'rgba(40, 40, 57, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: -80,
                    right: -80,
                    width: 256,
                    height: 256,
                    borderRadius: '50%',
                    bgcolor: 'rgba(82, 39, 255, 0.2)',
                    filter: 'blur(80px)',
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -80,
                    left: -80,
                    width: 256,
                    height: 256,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0, 255, 136, 0.1)',
                    filter: 'blur(80px)',
                    zIndex: 0,
                }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Avatar
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp0yD1RdlMSdQ517ts7BtXeTMnQpsIWjCnUH-r3Zdm08EPJgtXjoqDNVCp6zBo48uUP7NZ2WDqbh8gkz2qhYoXzK489Mne78VC93oh_-U6ogPG8HiXFfTzIfx5ArIfSzl-1EiW8EzrA8sDs9Y_Oa4Oo7fMal6_kd-4EKKyV4fFzdpttI9qmVf_qxN1JyqYIZPgdirxcneovMBVUTuHuYgiem6EYBZFKdWxxevJUVr1UAdMoJTxM_zBmJ8QnIowEPP2uyp0eQx4IDch"
                    sx={{
                        width: 120,
                        height: 120,
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        filter: 'blur(0.5px)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -16,
                        right: -16,
                        bgcolor: '#FFD700',
                        color: 'black',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                        border: '1px solid rgba(255, 215, 0, 0.5)',
                    }}
                >
                    <WorkspacePremium sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>BENEFACTOR</Typography>
                </Box>
            </Box>

            <Box sx={{ flex: 1, zIndex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
                        cryptosage.eth
                    </Typography>
                    <Chip
                        label="Level 42"
                        size="small"
                        sx={{
                            bgcolor: 'rgba(82, 39, 255, 0.2)',
                            color: 'primary.main',
                            border: '1px solid rgba(82, 39, 255, 0.3)',
                            fontWeight: 700,
                        }}
                    />
                </Box>

                <Typography variant="body1" sx={{ color: '#9d9db9', mb: 3, fontWeight: 500, fontFamily: 'monospace' }}>
                    {account || '0x71C2465715C49271C2465715C49271C2465739A2'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#9d9db9' }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2">Joined Nov 2021</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#9d9db9' }}>
                        <Verified sx={{ fontSize: 16, color: '#00ff88' }} />
                        <Typography variant="body2">KYC Verified (ZKP)</Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1, minWidth: 200 }}>
                <Button
                    variant="outlined"
                    startIcon={<Share />}
                    sx={{
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        fontWeight: 700,
                        py: 1,
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderColor: 'white',
                        }
                    }}
                >
                    Share Impact
                </Button>
                <Button
                    variant="contained"
                    startIcon={<VolunteerActivism />}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 700,
                        py: 1,
                        '&:hover': {
                            bgcolor: 'primary.dark',
                            filter: 'brightness(1.1)',
                        }
                    }}
                >
                    Donate Now
                </Button>
            </Box>
        </Box>
    );
};

export default DashboardProfile;
