import { Box, Typography, Button, Avatar, Tooltip } from '@mui/material';
import {
    Dashboard,
    Explore,
    Logout,
    AutoFixHigh,
    Lock,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { account, balance, disconnect, isConnected } = useWallet();

    const handleDisconnect = () => {
        disconnect();
        navigate('/');
    };

    const navItems = [
        { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard', protected: true },
        { label: 'Explore', icon: <Explore />, path: '/dashboard/projects', protected: false },
        { label: 'Badge Fusion', icon: <AutoFixHigh />, path: '/dashboard/fusion', protected: true },
    ];

    const NavButton = ({
        item
    }: {
        item: {
            label: string;
            icon: React.ReactNode;
            path: string;
            protected: boolean;
        }
    }) => {
        const isActive = location.pathname === item.path;
        const isLocked = item.protected && !isConnected;

        const button = (
            <Button
                fullWidth
                startIcon={item.icon}
                endIcon={isLocked ? <Lock sx={{ fontSize: 16, opacity: 0.5 }} /> : null}
                onClick={() => navigate(item.path)}
                disabled={isLocked}
                sx={{
                    justifyContent: 'flex-start',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isLocked
                        ? 'text.disabled'
                        : isActive
                            ? 'white'
                            : 'text.secondary',
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    opacity: isLocked ? 0.5 : 1,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    '&:hover': {
                        bgcolor: isLocked
                            ? 'transparent'
                            : isActive
                                ? 'primary.dark'
                                : 'rgba(255, 255, 255, 0.05)',
                        color: isLocked ? 'text.disabled' : 'white',
                        '& .MuiSvgIcon-root': {
                            color: isLocked
                                ? 'text.disabled'
                                : isActive
                                    ? 'white'
                                    : 'primary.main',
                        }
                    },
                    '& .MuiSvgIcon-root': {
                        color: isLocked
                            ? 'text.disabled'
                            : isActive
                                ? 'white'
                                : 'text.secondary',
                        transition: 'color 0.2s',
                    },
                    '&.Mui-disabled': {
                        color: 'text.disabled',
                        opacity: 0.5,
                    }
                }}
            >
                {item.label}
            </Button>
        );

        // Wrap with tooltip if locked
        if (isLocked) {
            return (
                <Tooltip
                    title="Connect wallet to access"
                    placement="right"
                    arrow
                >
                    <span>{button}</span>
                </Tooltip>
            );
        }

        return button;
    };

    return (
        <Box
            component="aside"
            sx={{
                width: 280, // Fixed width 280px (was 288px)
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                m: 2,
                borderRadius: 3,
                bgcolor: 'rgba(25, 24, 45, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 20,
                height: 'calc(100vh - 32px)',
                position: 'fixed',
                left: 0,
                top: 0,
            }}
        >
            {/* Logo - Clickable, redirects to Dashboard */}
            <Box
                onClick={() => navigate('/dashboard')}
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                    }
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(82, 39, 255, 0.2)',
                    }}
                >
                    <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px', color: 'white' }}>
                        <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor" />
                    </svg>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '0.95rem' }}>
                    Donation <Box component="span" sx={{ color: 'primary.main' }}>HUB</Box>
                </Typography>
            </Box>

            {/* Navigation - Cleaned up, removed placeholders and Community section */}
            <Box sx={{ flex: 1, px: 2, py: 3, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {navItems.map((item) => (
                        <NavButton key={item.label} item={item} />
                    ))}
                </Box>
            </Box>

            {/* User Profile */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    {isConnected ? (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <Avatar
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp0yD1RdlMSdQ517ts7BtXeTMnQpsIWjCnUH-r3Zdm08EPJgtXjoqDNVCp6zBo48uUP7NZ2WDqbh8gkz2qhYoXzK489Mne78VC93oh_-U6ogPG8HiXFfTzIfx5ArIfSzl-1EiW8EzrA8sDs9Y_Oa4Oo7fMal6_kd-4EKKyV4fFzdpttI9qmVf_qxN1JyqYIZPgdirxcneovMBVUTuHuYgiem6EYBZFKdWxxevJUVr1UAdMoJTxM_zBmJ8QnIowEPP2uyp0eQx4IDch"
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                    }}
                                />
                                <Box sx={{ overflow: 'hidden' }}>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main', display: 'block' }}>
                                        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'No Wallet'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {balance ? parseFloat(balance).toFixed(4) : '0.00'} ETH
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<Logout sx={{ fontSize: 16 }} />}
                                onClick={handleDisconnect}
                                sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'text.secondary',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    '&:hover': {
                                        borderColor: 'error.main',
                                        color: 'error.main',
                                        bgcolor: 'rgba(255, 46, 84, 0.1)',
                                    }
                                }}
                            >
                                DISCONNECT
                            </Button>
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Lock sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                Connect wallet to unlock features
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Sidebar;
