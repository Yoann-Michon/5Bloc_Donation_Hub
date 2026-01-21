import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import type { ProjectVote } from '../../types/governance';
import { getTimeRemaining } from '../../types/governance';

interface VoteTimerProps {
    vote: ProjectVote;
}

const VoteTimer = ({ vote }: VoteTimerProps) => {
    const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(vote));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining(getTimeRemaining(vote));
        }, 1000);

        return () => clearInterval(interval);
    }, [vote]);

    const formatTime = (ms: number) => {
        if (ms <= 0) return 'Voting ended';

        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const isUrgent = timeRemaining > 0 && timeRemaining < 24 * 60 * 60 * 1000;
    const isEnded = timeRemaining <= 0;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: isEnded
                    ? 'rgba(255, 255, 255, 0.05)'
                    : isUrgent
                    ? 'rgba(255, 165, 0, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${
                    isEnded
                        ? 'rgba(255, 255, 255, 0.1)'
                        : isUrgent
                        ? 'rgba(255, 165, 0, 0.3)'
                        : 'rgba(16, 185, 129, 0.3)'
                }`,
            }}
        >
            <AccessTime
                sx={{
                    fontSize: 20,
                    color: isEnded ? 'text.secondary' : isUrgent ? '#FFA500' : '#10B981',
                }}
            />
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                    {isEnded ? 'Ended' : 'Time remaining'}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: isEnded ? 'text.secondary' : isUrgent ? '#FFA500' : '#10B981',
                    }}
                >
                    {formatTime(timeRemaining)}
                </Typography>
            </Box>
        </Box>
    );
};

export default VoteTimer;
