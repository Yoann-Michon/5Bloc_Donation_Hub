import { useState, useCallback, useEffect } from 'react';
import { governanceService } from '../services/governanceService';
import { useWallet } from './useWallet';
import type {
    ProjectVote,
    VoteChoice,
    Badge,
} from '../types/governance';
import {
    calculateVotingPower,
    getVotingPowerBreakdown,
    hasReachedQuorum,
    getParticipationRate,
    getApprovalRate,
    isVoteApproved,
    hasUserVoted,
    getUserVote,
    getTimeRemaining,
} from '../types/governance';

export const useGovernance = () => {
    const { account } = useWallet();
    const [userBadges, setUserBadges] = useState<Badge[]>([]);
    const [activeVotes, setActiveVotes] = useState<ProjectVote[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserBadges = useCallback(async () => {
        if (!account) return;

        try {
            const badges = await governanceService.getUserBadges(account);
            setUserBadges(badges);
        } catch (error) {
            console.error('Failed to fetch user badges:', error);
        }
    }, [account]);

    const fetchActiveVotes = useCallback(async () => {
        try {
            const votes = await governanceService.getActiveVotes();
            setActiveVotes(votes);
        } catch (error) {
            console.error('Failed to fetch active votes:', error);
        }
    }, []);

    useEffect(() => {
        if (account) {
            fetchUserBadges();
        }
    }, [account, fetchUserBadges]);

    useEffect(() => {
        fetchActiveVotes();
        const interval = setInterval(fetchActiveVotes, 30000);
        return () => clearInterval(interval);
    }, [fetchActiveVotes]);

    const votingPower = calculateVotingPower(userBadges);
    const votingPowerBreakdown = getVotingPowerBreakdown(userBadges);

    const submitAssociationRequest = useCallback(
        async (data: {
            organizationName: string;
            email: string;
            description: string;
            website?: string;
            proofDocuments: string[];
            reason: string;
        }) => {
            setIsLoading(true);
            try {
                return await governanceService.submitAssociationRequest(data);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const voteOnProject = useCallback(
        async (projectId: number, vote: VoteChoice) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            if (votingPower === 0) {
                throw new Error('You need at least one badge to vote');
            }

            setIsLoading(true);
            try {
                const result = await governanceService.submitVote(projectId, vote);
                await fetchActiveVotes();
                return result;
            } finally {
                setIsLoading(false);
            }
        },
        [account, votingPower, fetchActiveVotes]
    );

    const getProjectVote = useCallback(async (projectId: number) => {
        try {
            return await governanceService.getProjectVote(projectId);
        } catch (error) {
            console.error('Failed to get project vote:', error);
            return null;
        }
    }, []);

    return {
        account,
        userBadges,
        votingPower,
        votingPowerBreakdown,
        activeVotes,
        isLoading,
        submitAssociationRequest,
        voteOnProject,
        getProjectVote,
        fetchUserBadges,
        fetchActiveVotes,
        hasReachedQuorum,
        getParticipationRate,
        getApprovalRate,
        isVoteApproved,
        hasUserVoted,
        getUserVote,
        getTimeRemaining,
    };
};
