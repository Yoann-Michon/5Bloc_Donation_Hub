import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Container,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { Menu as MenuIcon, AccountBalanceWallet, Close, Logout, VerifiedUser } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import GradientText from '../custom/GradientText';
import { useWallet } from '../../hooks/useWallet';
import WalletConnectionModal from '../web3/WalletConnectionModal';
import AddressDisplay from '../web3/AddressDisplay';
import NetworkSwitcher from '../web3/NetworkSwitcher';
import { Menu, MenuItem, Avatar } from '@mui/material';


const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Web3 Hook
  const { isConnected, account, chainId, disconnect, balance } = useWallet();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    disconnect();
    handleMenuClose();
  };

  const navItems = [
    { label: 'Projects', path: '/projects' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'How it Works', path: '#' },
    { label: 'About', path: '#' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={handleDrawerToggle} aria-label="close drawer">
          <Close />
        </IconButton>
      </Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 32, height: 32, color: 'primary.main' }}>
          <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor" />
          </svg>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Donation Hub</Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{ textAlign: 'center', borderRadius: 2 }}
            >
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 2 }}>
        {!isConnected ? (
          <Button
            variant="contained"
            onClick={() => setWalletModalOpen(true)}
            startIcon={<AccountBalanceWallet />}
            fullWidth
            sx={{ height: 48 }}
          >
            Connect Wallet
          </Button>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <NetworkSwitcher variant="compact" />
            <AddressDisplay address={account!} chainId={chainId} variant="chip" />
            <Button
              variant="outlined"
              color="error"
              onClick={handleDisconnect}
              startIcon={<Logout />}
              fullWidth
            >
              Disconnect
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Box sx={{ width: 32, height: 32, color: 'primary.main' }}>
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor" />
                </svg>
              </Box>
              <GradientText
                colors={["#5227FF", "#00E5FF", "#5227FF"]}
                animationSpeed={5}
                showBorder={false}
              >
                <Typography variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.015em' }}>
                  Community Donation Hub
                </Typography>
              </GradientText>
            </Link>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
              <Box component="nav" sx={{ display: 'flex', gap: 4 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: 'text.primary',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&:hover': { color: 'primary.main', background: 'transparent' },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              {/* Web3 Section */}
              {!isConnected ? (
                <Button
                  variant="contained"
                  onClick={() => setWalletModalOpen(true)}
                  startIcon={<AccountBalanceWallet />}
                  sx={{ height: 40, px: 3 }}
                >
                  Connect Wallet
                </Button>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <NetworkSwitcher variant="compact" />

                  <Box
                    onClick={handleMenuOpen}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      borderRadius: 10,
                      pl: 0.5,
                      pr: 2,
                      py: 0.5,
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    <AddressDisplay
                      address={account!}
                      chainId={chainId}
                      variant="inline"
                      showCopy={false}
                      showAvatar={true}
                    />
                  </Box>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        width: 220,
                        background: 'rgba(11, 0, 26, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="caption" color="text.secondary">Balance</Typography>
                      <Typography variant="h6">{balance ? parseFloat(balance).toFixed(4) : '0.00'} ETH</Typography>
                    </Box>
                    <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose} sx={{ mt: 1 }}>
                      <VerifiedUser sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleDisconnect} sx={{ color: 'error.main' }}>
                      <Logout sx={{ mr: 2, fontSize: 20 }} />
                      Disconnect
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnect={() => setWalletModalOpen(false)}
      />

      {/* Mobile Drawer */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Navbar;
