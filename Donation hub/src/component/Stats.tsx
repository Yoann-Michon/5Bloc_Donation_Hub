import { Box, Container, Card, CardContent, Typography } from '@mui/material';
import { Payment, RocketLaunch, Groups } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
  iconBgColor?: string;
  iconColor?: string;
}

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  subtitleColor,
  iconBgColor,
  iconColor,
}: StatCardProps) => {
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              p: 0.75,
              bgcolor: iconBgColor || 'primary.main',
              borderRadius: 1,
              color: iconColor || 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
            }}
          >
            <Box sx={{ fontSize: 20 }}>{icon}</Box>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{
            color: 'text.primary',
            fontWeight: 700,
            fontSize: '1.5rem',
            mb: 0.75,
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: subtitleColor || 'text.secondary',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.875rem',
          }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Stats = () => {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: 'background.default',
        py: 4,
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          <StatCard
            icon={<Payment />}
            title="Total Donations"
            value="$2.4M+"
            subtitle="+ 12% this month"
            subtitleColor="success.main"
            iconBgColor="rgba(103, 100, 242, 0.1)"
            iconColor="primary.main"
          />

          <StatCard
            icon={<RocketLaunch />}
            title="Active Projects"
            value="150+"
            subtitle="Global Impact"
            iconBgColor="rgba(59, 130, 246, 0.1)"
            iconColor="info.main"
          />

          <StatCard
            icon={<Groups />}
            title="Community Members"
            value="12k+"
            subtitle="Growing Daily"
            iconBgColor="rgba(168, 85, 247, 0.1)"
            iconColor="#a855f7"
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Stats;
