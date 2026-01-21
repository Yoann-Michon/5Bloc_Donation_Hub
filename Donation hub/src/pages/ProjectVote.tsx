import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Alert,
    Chip,
    Divider,
} from '@mui/material';
import { HowToVote, Info, ArrowBack } from '@mui/icons-material';
import { useGovernance } from '../hooks/useGovernance';
import { useProjects } from '../hooks/useProjects';
import { useToast } from '../context/ToastContext';
import VotingPowerDisplay from '../component/governance/VotingPowerDisplay';
import VoteResults from '../component/governance/VoteResults';
import VoteTimer from '../component/governance/VoteTimer';
import type { ProjectVote, VoteChoice } from '../types/governance';

const ProjectVotePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const {
        getProjectVote,
        voteOnProject,
        votingPower,
        votingPowerBreakdown,
        hasUserVoted,
        getUserVote,
        isLoading,
    } = useGovernance();
    const { getProjectById } = useProjects();

    const [vote, setVote] = useState<ProjectVote | null>(null);
    const [selectedVote, setSelectedVote] = useState<VoteChoice>('For');
    const [hasVoted, setHasVoted] = useState(false);
    const [userVote, setUserVote] = useState<VoteChoice | null>(null);

    const project = id ? getProjectById(Number(id)) : null;

    useEffect(() => {
        const fetchVote = async () => {
            if (!id) return;

            const voteData = await getProjectVote(Number(id));
            if (voteData) {
                setVote(voteData);
                const voted = hasUserVoted(voteData, ''); // Will use account from hook
                setHasVoted(voted);
                if (voted) {
                    const userVoteData = getUserVote(voteData, '');
                    setUserVote(userVoteData?.vote || null);
                }
            }
        };

        fetchVote();
        const interval = setInterval(fetchVote, 10000);
        return () => clearInterval(interval);
    }, [id, getProjectVote, hasUserVoted, getUserVote]);

    const handleSubmitVote = async () => {
        if (!id) return;

        try {
            await voteOnProject(Number(id), selectedVote);
            showToast('Vote submitted successfully!', 'success');
            const voteData = await getProjectVote(Number(id));
            if (voteData) {
                setVote(voteData);
                setHasVoted(true);
                setUserVote(selectedVote);
            }
        } catch (error) {
            const err = error as Error;
            showToast(err.message || 'Failed to submit vote', 'error');
        }
    };

    if (!project) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Project not found</Alert>
            </Container>
        );
    }

    if (!vote) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">No active vote for this project</Alert>
            </Container>
        );
    }

    const canVote = votingPower > 0 && !hasVoted && vote.status === 'Active';

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
                Back
            </Button>

            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Governance Vote
                    </Typography>
                    <Chip
                        label={vote.status}
                        color={vote.status === 'Active' ? 'success' : 'default'}
                        size="small"
                    />
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Cast your vote to approve or reject this project proposal
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                {project.title}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Chip label={project.category} size="small" color="primary" />
                                <Chip
                                    label={`${project.goal} ETH Goal`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>

                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                {project.description}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                        Organization
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {project.author}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                        Wallet
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                        {project.ownerWallet.slice(0, 6)}...{project.ownerWallet.slice(-4)}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                Vote Results
                            </Typography>
                            <VoteResults vote={vote} showDetails={true} />
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Card
                        sx={{
                            bgcolor: 'rgba(82, 39, 255, 0.05)',
                            border: '1px solid rgba(82, 39, 255, 0.2)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <VoteTimer vote={vote} />

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                                Your Voting Power
                            </Typography>

                            <VotingPowerDisplay
                                votingPower={votingPower}
                                breakdown={votingPowerBreakdown}
                                size="medium"
                            />

                            {votingPower === 0 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    You need at least one badge to vote. Participate in the platform to earn badges!
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {hasVoted ? (
                        <Alert severity="success" icon={<HowToVote />}>
                            You have already voted on this proposal.
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                                Your vote: {userVote}
                            </Typography>
                        </Alert>
                    ) : (
                        <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <HowToVote />
                                    Cast Your Vote
                                </Typography>

                                {vote.status !== 'Active' ? (
                                    <Alert severity="info">
                                        Voting has ended for this proposal.
                                    </Alert>
                                ) : (
                                    <>
                                        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                                            <RadioGroup
                                                value={selectedVote}
                                                onChange={(e) => setSelectedVote(e.target.value as VoteChoice)}
                                            >
                                                <FormControlLabel
                                                    value="For"
                                                    control={<Radio />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                For - Approve this project
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                I believe this project should be funded
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor:
                                                            selectedVote === 'For' ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                                                        bgcolor:
                                                            selectedVote === 'For'
                                                                ? 'rgba(16, 185, 129, 0.1)'
                                                                : 'transparent',
                                                        mb: 1,
                                                    }}
                                                />
                                                <FormControlLabel
                                                    value="Against"
                                                    control={<Radio />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                Against - Reject this project
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                I don't think this project should be funded
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor:
                                                            selectedVote === 'Against' ? '#EF4444' : 'rgba(255, 255, 255, 0.1)',
                                                        bgcolor:
                                                            selectedVote === 'Against'
                                                                ? 'rgba(239, 68, 68, 0.1)'
                                                                : 'transparent',
                                                        mb: 1,
                                                    }}
                                                />
                                                <FormControlLabel
                                                    value="Abstain"
                                                    control={<Radio />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                Abstain
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                I choose not to vote on this project
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor:
                                                            selectedVote === 'Abstain'
                                                                ? '#94A3B8'
                                                                : 'rgba(255, 255, 255, 0.1)',
                                                        bgcolor:
                                                            selectedVote === 'Abstain'
                                                                ? 'rgba(148, 163, 184, 0.1)'
                                                                : 'transparent',
                                                    }}
                                                />
                                            </RadioGroup>
                                        </FormControl>

                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            onClick={handleSubmitVote}
                                            disabled={!canVote || isLoading}
                                            startIcon={<HowToVote />}
                                        >
                                            {isLoading ? 'Submitting...' : `Submit Vote (${votingPower} votes)`}
                                        </Button>

                                        <Alert severity="info" icon={<Info />} sx={{ mt: 2 }}>
                                            Your vote is final and cannot be changed once submitted.
                                        </Alert>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default ProjectVotePage;
