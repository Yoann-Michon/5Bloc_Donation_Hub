import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    LinearProgress,
    Grid,
    Alert,
    Box,
} from '@mui/material';
import { ThumbUp, ThumbDown, HowToVote, AccessTime } from '@mui/icons-material';
import { governanceService } from '../services/governanceService';
import { useWallet } from '../hooks/useWallet';
import { useToast } from '../context/ToastContext';
import { calculateVotingPower, hasUserVoted, getUserVote, VOTING_POWER_WEIGHTS } from '../types/governance';
import type { ProjectVote, Badge, VoteChoice } from '../types/governance';
import projectsData from '../data/projects.json';

interface ProjectInfo {
    id: number;
    title: string;
    description: string;
}

const ProjectVotes = () => {
    const { account } = useWallet();
    const { showToast } = useToast();
    const [votes, setVotes] = useState<ProjectVote[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const totalVotingPower = calculateVotingPower(badges);

    // Get project info from projects.json
    const getProjectInfo = (projectId: number): ProjectInfo => {
        const project = projectsData.find(p => p.id === projectId);
        return project || { id: projectId, title: `Project #${projectId}`, description: 'No description available' };
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [votesData, badgesData] = await Promise.all([
                    governanceService.getActiveVotes(),
                    account ? governanceService.getUserBadges(account) : Promise.resolve([]),
                ]);
                setVotes(votesData);
                setBadges(badgesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [account]);

    const handleVote = async (projectId: number, choice: VoteChoice) => {
        if (totalVotingPower === 0) {
            showToast('You need badges to vote!', 'warning');
            return;
        }

        try {
            await governanceService.submitVote(projectId, choice);
            showToast(`Vote submitted successfully! (+${totalVotingPower} voting power)`, 'success');

            // Update local state
            setVotes(prev => prev.map(v =>
                v.projectId === projectId
                    ? {
                        ...v,
                        votesFor: choice === 'For' ? v.votesFor + totalVotingPower : v.votesFor,
                        votesAgainst: choice === 'Against' ? v.votesAgainst + totalVotingPower : v.votesAgainst,
                        voters: [...v.voters, {
                            walletAddress: account!,
                            votingPower: totalVotingPower,
                            vote: choice,
                            votedAt: new Date().toISOString(),
                            badgesUsed: badges
                        }]
                    }
                    : v
            ));
        } catch (error) {
            showToast('Failed to submit vote', 'error');
        }
    };

    const getTimeRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h remaining`;
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <LinearProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Project Votes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Vote on project proposals using your badges
                </Typography>
            </Box>

            {/* Voting Power Card */}
            <Card sx={{ mb: 4, bgcolor: 'rgba(82, 39, 255, 0.1)', border: '1px solid rgba(82, 39, 255, 0.3)' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Your Voting Power
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Based on your {badges.filter(b => b.unlocked).length} badge{badges.filter(b => b.unlocked).length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <HowToVote sx={{ fontSize: 40, color: 'primary.main' }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {totalVotingPower}
                            </Typography>
                        </Box>
                    </Box>
                    {badges.filter(b => b.unlocked).length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {badges.filter(b => b.unlocked).map(badge => (
                                <Chip
                                    key={badge.id}
                                    label={`${badge.name} (+${VOTING_POWER_WEIGHTS[badge.tier] * badge.count})`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(82, 39, 255, 0.2)' }}
                                />
                            ))}
                        </Box>
                    )}
                    {totalVotingPower === 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Earn badges by donating to projects to gain voting power!
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Active Votes */}
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Active Proposals ({votes.length})
            </Typography>

            {votes.length === 0 ? (
                <Alert severity="info">No active votes at the moment</Alert>
            ) : (
                <Grid container spacing={3}>
                    {votes.map(vote => {
                        const projectInfo = getProjectInfo(vote.projectId);
                        const totalVotes = vote.votesFor + vote.votesAgainst;
                        const forPercentage = totalVotes > 0 ? (vote.votesFor / totalVotes) * 100 : 50;
                        const userHasVoted = account ? hasUserVoted(vote, account) : false;
                        const userVoteRecord = account ? getUserVote(vote, account) : undefined;

                        return (
                            <Grid size={{ xs: 12, md: 6 }} key={vote.projectId}>
                                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {projectInfo.title}
                                            </Typography>
                                            <Chip
                                                icon={<AccessTime />}
                                                label={getTimeRemaining(vote.endDate)}
                                                size="small"
                                                color="warning"
                                            />
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            {projectInfo.description.substring(0, 100)}...
                                        </Typography>

                                        {/* Vote Progress */}
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="success.main">
                                                    For: {vote.votesFor}
                                                </Typography>
                                                <Typography variant="caption" color="error.main">
                                                    Against: {vote.votesAgainst}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', height: 8, borderRadius: 1, overflow: 'hidden' }}>
                                                <Box sx={{ width: `${forPercentage}%`, bgcolor: 'success.main' }} />
                                                <Box sx={{ width: `${100 - forPercentage}%`, bgcolor: 'error.main' }} />
                                            </Box>
                                        </Box>

                                        {/* Vote Buttons */}
                                        {userHasVoted ? (
                                            <Alert
                                                severity={userVoteRecord?.vote === 'For' ? 'success' : 'error'}
                                                sx={{ py: 0.5 }}
                                            >
                                                You voted {userVoteRecord?.vote === 'For' ? 'FOR' : 'AGAINST'} this proposal
                                            </Alert>
                                        ) : (
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<ThumbUp />}
                                                    onClick={() => handleVote(vote.projectId, 'For')}
                                                    disabled={totalVotingPower === 0}
                                                >
                                                    Vote For
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<ThumbDown />}
                                                    onClick={() => handleVote(vote.projectId, 'Against')}
                                                    disabled={totalVotingPower === 0}
                                                >
                                                    Vote Against
                                                </Button>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
};

export default ProjectVotes;
