import { Box, Typography, Tooltip } from '@mui/material';
import { MilitaryTech } from '@mui/icons-material';
import type { VotingPowerBreakdown, BadgeTier } from '../../types/governance';

interface VotingPowerDisplayProps {
    votingPower: number;
    breakdown?: VotingPowerBreakdown;
    size?: 'small' | 'medium' | 'large';
}

const TIER_COLORS: Record<BadgeTier, string> = {
    Legendary: '#FFD700',
    Epic: '#A855F7',
    Rare: '#5227FF',
    Common: '#10B981',
};

const VotingPowerDisplay = ({ votingPower, breakdown, size = 'medium' }: VotingPowerDisplayProps) => {
    const fontSize = size === 'large' ? '2rem' : size === 'medium' ? '1.5rem' : '1.25rem';
    const iconSize = size === 'large' ? 32 : size === 'medium' ? 24 : 20;

    const tooltipContent = breakdown ? (
        <Box sx={{ p: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
                Breakdown:
            </Typography>
            {breakdown.badges.map((badge, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: TIER_COLORS[badge.tier] }}>
                        {badge.count}x {badge.tier}:
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 2, fontWeight: 700 }}>
                        {badge.totalPower} votes
                    </Typography>
                </Box>
            ))}
        </Box>
    ) : null;

    return (
        <Tooltip title={tooltipContent || ''} arrow>
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(82, 39, 255, 0.1)',
                    border: '1px solid rgba(82, 39, 255, 0.3)',
                    cursor: breakdown ? 'pointer' : 'default',
                }}
            >
                <MilitaryTech sx={{ color: 'primary.main', fontSize: iconSize }} />
                <Typography
                    sx={{
                        fontSize,
                        fontWeight: 700,
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: 'primary.main',
                    }}
                >
                    {votingPower}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {votingPower === 1 ? 'vote' : 'votes'}
                </Typography>
            </Box>
        </Tooltip>
    );
};

export default VotingPowerDisplay;
