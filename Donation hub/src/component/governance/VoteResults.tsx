import { Box, Typography, LinearProgress } from '@mui/material';
import { CheckCircle, Cancel, RemoveCircle } from '@mui/icons-material';
import type { ProjectVote } from '../../types/governance';
import { getParticipationRate, getApprovalRate, hasReachedQuorum, isVoteApproved } from '../../types/governance';

interface VoteResultsProps {
    vote: ProjectVote;
    showDetails?: boolean;
}

const VoteResults = ({ vote, showDetails = true }: VoteResultsProps) => {
    const participation = getParticipationRate(vote);
    const approvalRate = getApprovalRate(vote);
    const quorumReached = hasReachedQuorum(vote);
    const voteApproved = isVoteApproved(vote);

    const totalExpressedVotes = vote.votesFor + vote.votesAgainst;
    const forPercentage = totalExpressedVotes > 0 ? (vote.votesFor / totalExpressedVotes) * 100 : 0;
    const againstPercentage = totalExpressedVotes > 0 ? (vote.votesAgainst / totalExpressedVotes) * 100 : 0;

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Participation
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {participation.toFixed(1)}% ({vote.votesFor + vote.votesAgainst + vote.abstentions}/
                        {vote.totalVotingPower})
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={Math.min(participation, 100)}
                    sx={{
                        height: 8,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            bgcolor: quorumReached ? '#10B981' : '#FFA500',
                        },
                    }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Quorum: {vote.quorumThreshold} votes
                    </Typography>
                    {quorumReached ? (
                        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
                            ✓ Quorum reached
                        </Typography>
                    ) : (
                        <Typography variant="caption" sx={{ color: '#FFA500', fontWeight: 700 }}>
                            ⚠ Quorum not reached
                        </Typography>
                    )}
                </Box>
            </Box>

            {showDetails && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                        Vote Distribution
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                                    <Typography variant="body2">For</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {vote.votesFor} ({forPercentage.toFixed(1)}%)
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(forPercentage, 100)}
                                sx={{
                                    height: 6,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 2,
                                        bgcolor: '#10B981',
                                    },
                                }}
                            />
                        </Box>

                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Cancel sx={{ fontSize: 18, color: '#EF4444' }} />
                                    <Typography variant="body2">Against</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {vote.votesAgainst} ({againstPercentage.toFixed(1)}%)
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(againstPercentage, 100)}
                                sx={{
                                    height: 6,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 2,
                                        bgcolor: '#EF4444',
                                    },
                                }}
                            />
                        </Box>

                        {vote.abstentions > 0 && (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <RemoveCircle sx={{ fontSize: 18, color: '#94A3B8' }} />
                                        <Typography variant="body2">Abstain</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {vote.abstentions}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: voteApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${voteApproved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {quorumReached ? 'Approval Rate' : 'Current Status'}
                </Typography>
                {quorumReached ? (
                    <Typography variant="h6" sx={{ color: voteApproved ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                        {voteApproved
                            ? `✓ Approved (${approvalRate.toFixed(1)}% ≥ ${vote.approvalThreshold}%)`
                            : `✗ Rejected (${approvalRate.toFixed(1)}% < ${vote.approvalThreshold}%)`}
                    </Typography>
                ) : (
                    <Typography variant="body2" sx={{ color: '#FFA500' }}>
                        Quorum not reached. Vote will be rejected unless {vote.quorumThreshold} total votes are cast.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default VoteResults;
