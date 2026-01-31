import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Logout,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import WalletConnectionModal from '../web3/WalletConnectionModal';
import AddressDisplay from '../web3/AddressDisplay';
import NetworkSwitcher from '../web3/NetworkSwitcher';

const Header = () => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { isConnected, account, chainId, disconnect, balance } = useWallet();

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

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          height: 64,
          background: 'rgba(11, 0, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, md: 3 },
          gap: 3,
        }}
      >
        <Box sx={{ flex: 1, display: { xs: 'block', sm: 'none' } }} />

        {isConnected && (
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <NetworkSwitcher variant="compact" />
          </Box>
        )}

        {!isConnected ? (
          <Button
            variant="contained"
            onClick={() => setWalletModalOpen(true)}
            startIcon={<AccountBalanceWallet />}
            sx={{
              height: 40,
              px: 3,
              textTransform: 'none',
              fontSize: '0.875rem',
              borderRadius: 1.5,
            }}
          >
            Connect Wallet
          </Button>
        ) : (
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 12.5,
              pl: 0.5,
              pr: 2,
              py: 0.5,
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: 'primary.main',
              },
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
        )}

        {/* Wallet Dropdown Menu */}
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
            },
          }}
        >
          {/* Balance Display */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Balance
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {balance ? parseFloat(balance).toFixed(4) : '0.00'} ETH
            </Typography>
          </Box>

          {/* Menu Items */}
          <MenuItem
            component={Link}
            to="/dashboard"
            onClick={handleMenuClose}
            sx={{ mt: 1 }}
          >
            <DashboardIcon sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
            Dashboard
          </MenuItem>
          <MenuItem onClick={handleDisconnect} sx={{ color: 'error.main' }}>
            <Logout sx={{ mr: 2, fontSize: 20 }} />
            Disconnect
          </MenuItem>
        </Menu>
      </Box>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnect={() => setWalletModalOpen(false)}
      />
    </>
  );
};

export default Header;
