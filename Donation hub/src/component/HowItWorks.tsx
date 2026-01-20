import { Box, Container, Typography } from '@mui/material';
import { AccountBalanceWallet, Search, CurrencyBitcoin, Stars } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface StepProps {
  icon: ReactNode;
  number: number;
  title: string;
  description: string;
  filled?: boolean;
}

const Step = ({ icon, number, title, description, filled = false }: StepProps) => {
  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        width: '100%',
        '&:hover .step-icon': {
          transform: 'scale(1.1)',
        },
      }}
    >
      <Box
        className="step-icon"
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: filled ? 'primary.main' : 'background.paper',
          border: filled ? 'none' : '2px solid',
          borderColor: 'primary.main',
          color: filled ? 'white' : 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
          mb: 3,
          transition: 'transform 0.3s ease',
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: 'text.primary',
          fontWeight: 700,
          mb: 1,
        }}
      >
        {number}. {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
          px: 1,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 28 }} />,
      title: 'Connect Wallet',
      description: 'Link your MetaMask or WalletConnect to verify your identity securely.',
      filled: true,
    },
    {
      icon: <Search sx={{ fontSize: 28 }} />,
      title: 'Choose Cause',
      description: 'Browse vetted projects and select one that aligns with your values.',
      filled: false,
    },
    {
      icon: <CurrencyBitcoin sx={{ fontSize: 28 }} />,
      title: 'Donate Crypto',
      description: "Send ETH or stablecoins directly to the project's smart contract.",
      filled: false,
    },
    {
      icon: <Stars sx={{ fontSize: 28 }} />,
      title: 'Receive NFT',
      description: 'Get a unique "Proof of Impact" NFT badge in your wallet.',
      filled: false,
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        bgcolor: 'background.default',
        py: 4,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              mb: 2,
            }}
          >
            How it's works
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            Start your journey of impact in four simple, transparent steps secured by the
            blockchain.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative' }}>
          
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: 28,
              left: 0,
              width: '100%',
              height: 4,
              bgcolor: 'divider',
              zIndex: 0,
            }}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              gap: { xs: 3, md: 2 },
              position: 'relative',
            }}
          >
            {steps.map((step, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Step
                  icon={step.icon}
                  number={index + 1}
                  title={step.title}
                  description={step.description}
                  filled={step.filled}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
