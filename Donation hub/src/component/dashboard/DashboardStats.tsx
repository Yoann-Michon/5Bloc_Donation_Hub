import { Box, Typography, Grid, Skeleton } from '@mui/material';
import { TrendingUp, AccountBalanceWallet, MilitaryTech, VolunteerActivism } from '@mui/icons-material';
import { useWallet } from '../../hooks/useWallet';
import { useDonationHistory } from '../../hooks/useDonationHistory';
import { useState, useEffect } from 'react';

const DashboardStats = () => {
    const { balance, account, getBadgeContract } = useWallet();
    const { transactions } = useDonationHistory();
    const [badgeCount, setBadgeCount] = useState<string | null>(null);
    const [totalDonated, setTotalDonated] = useState<string>('0');

    useEffect(() => {
        const fetchBadgeCount = async () => {
            if (account && getBadgeContract) {
                try {
                    const contract = getBadgeContract();
                    if (contract) {
                        const count = await contract.balanceOf(account);
                        setBadgeCount(count.toString());
                    }
                } catch (error) {
                    setBadgeCount('0');
                }
            }
        };

        if (account) {
            fetchBadgeCount();
        } else {
            setBadgeCount(null);
        }
    }, [account, getBadgeContract]);

    useEffect(() => {
        if (transactions && transactions.length > 0) {
            const total = transactions
                .filter(tx => tx.type === 'mint')
                .reduce((acc, tx) => acc + parseFloat(tx.amount || '0'), 0);

            setTotalDonated(total.toFixed(4));
        } else {
            setTotalDonated('0');
        }
    }, [transactions]);


    const stats = [
        {
            label: 'Total Donated',
            value: `${totalDonated} ETH`,
            change: transactions.length > 0 ? `+${transactions.length} donations` : 'Start donating',
            isPositive: true,
            icon: <VolunteerActivism sx={{ fontSize: 24, color: '#5227FF' }} />,
            gradient: 'linear-gradient(to right, #5227FF, transparent)',
        },
        {
            label: 'My Badges',
            value: badgeCount !== null ? badgeCount : '...',
            change: 'Lifetime earned',
            isPositive: true,
            icon: <MilitaryTech sx={{ fontSize: 24, color: '#00ff88' }} />,
            gradient: 'linear-gradient(to right, #00ff88, transparent)',
        },
        {
            label: 'Wallet Balance',
            value: balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0.0000 ETH',
            subtext: 'Available',
            icon: <AccountBalanceWallet sx={{ fontSize: 24, color: 'white' }} />,
            gradient: 'linear-gradient(to right, rgba(255, 255, 255, 0.2), transparent)',
        },
    ];

    return (
        <Grid container spacing={2} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                    <Box
                        sx={{
                            position: 'relative',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden',
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#9d9db9', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', fontSize: '0.75rem' }}>
                                {stat.label}
                            </Typography>
                            <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)' }}>
                                {stat.icon}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', lineHeight: 1 }}>
                                {stat.value === '...' ? <Skeleton width={60} /> : stat.value}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {stat.change && (
                                <Box sx={{ display: 'flex', alignItems: 'center', color: stat.isPositive ? '#00ff88' : '#ff2e54', fontWeight: 600, fontSize: '0.75rem' }}>
                                    <TrendingUp sx={{ fontSize: 12, mr: 0.5 }} />
                                    {stat.change}
                                </Box>
                            )}
                            {stat.subtext && (
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, fontSize: '0.75rem' }}>
                                    {stat.subtext}
                                </Typography>
                            )}
                        </Box>

                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: 4,
                                background: stat.gradient,
                                opacity: 0.3,
                            }}
                        />
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};

export default DashboardStats;
