import { Box, Container, Typography, Card, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Verified, Shield, EmojiEvents, Diamond } from '@mui/icons-material';

interface LevelCardProps {
  icon: React.ReactNode;
  title: string;
  tier: string;
  benefits: string[];
  highlighted?: boolean;
  highlightColor?: string;
  iconBgColor?: string;
  iconColor?: string;
  borderColor?: string;
  bgColor?: string;
}

const LevelCard = ({
  icon,
  title,
  tier,
  benefits,
  highlighted = false,
  highlightColor,
  iconBgColor,
  iconColor,
  borderColor,
  bgColor,
}: LevelCardProps) => {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        border: '1px solid',
        borderColor: borderColor || 'divider',
        bgcolor: bgColor || 'background.paper',
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
        ...(highlighted && {
          boxShadow: `0 10px 25px -5px ${highlightColor}20`,
        }),
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: iconBgColor || 'rgba(0, 0, 0, 0.05)',
          color: iconColor || 'text.primary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="h3"
        sx={{
          color: 'text.primary',
          fontWeight: 700,
          fontSize: '1.25rem',
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          mb: 1.5,
        }}
      >
        {tier}
      </Typography>

      <Divider sx={{ width: '100%', my: 1.5 }} />

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        {benefits.map((benefit, index) => (
          <Typography
            key={index}
            component="li"
            variant="body2"
            sx={{
              color: 'text.secondary',
            }}
          >
            {benefit}
          </Typography>
        ))}
      </Box>
    </Card>
  );
};

const ContributionLevels = () => {
  const levels = [
    {
      icon: <Verified sx={{ fontSize: 32 }} />,
      title: 'Donor',
      tier: 'Bronze Tier',
      benefits: ['Bronze Badge NFT', 'Community Access', '0-1 ETH Total'],
      iconBgColor: 'rgba(180, 83, 9, 0.1)',
      iconColor: '#b45309',
    },
    {
      icon: <Shield sx={{ fontSize: 32 }} />,
      title: 'Sponsor',
      tier: 'Silver Tier',
      benefits: ['Silver Badge NFT', 'Voting Rights (x1)', '1-5 ETH Total'],
      iconBgColor: 'rgba(100, 116, 139, 0.1)',
      iconColor: '#64748b',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 32 }} />,
      title: 'Patron',
      tier: 'Gold Tier',
      benefits: ['Gold Badge NFT', 'Voting Rights (x5)', '5-20 ETH Total'],
      iconBgColor: 'rgba(245, 158, 11, 0.2)',
      iconColor: '#d97706',
      borderColor: '#fbbf24',
      bgColor: 'rgba(254, 243, 199, 0.3)',
    },
    {
      icon: <Diamond sx={{ fontSize: 32 }} />,
      title: 'Benefactor',
      tier: 'Diamond Tier',
      benefits: ['Diamond Badge NFT', 'Governance Seat', '20+ ETH Total'],
      iconBgColor: 'rgba(16, 185, 129, 0.2)',
      iconColor: '#059669',
      borderColor: '#10b981',
      bgColor: 'rgba(209, 250, 229, 0.3)',
      highlighted: true,
      highlightColor: '#10b981',
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h2"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Contribution Levels
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            Unlock exclusive badges and governance rights based on your support.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {levels.map((level, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <LevelCard {...level} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ContributionLevels;
