/**
 * Types pour le système de gouvernance décentralisée
 * Voir GOVERNANCE_SYSTEM.md pour la documentation complète
 */

export type BadgeTier = 'Legendary' | 'Epic' | 'Rare' | 'Common';

export type VoteChoice = 'For' | 'Against' | 'Abstain';

export type VoteStatus = 'Active' | 'Ended' | 'QuorumNotReached' | 'AdminOverride';

export type AssociationRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'NeedsInfo';

export interface Badge {
    id: number;
    name: string;
    tier: BadgeTier;
    count: number;
    unlocked: boolean;
    image?: string;
    description?: string;
    unlockedAt?: string;
}

export const VOTING_POWER_WEIGHTS: Record<BadgeTier, number> = {
    Legendary: 10,
    Epic: 5,
    Rare: 3,
    Common: 1,
};

export interface VoterRecord {
    walletAddress: string;
    votingPower: number;
    vote: VoteChoice;
    votedAt: string;
    badgesUsed: Badge[];
}

export interface ProjectVote {
    projectId: number;
    startDate: string;
    endDate: string;
    status: VoteStatus;
    totalVotingPower: number;
    votesFor: number;
    votesAgainst: number;
    abstentions: number;
    quorumThreshold: number;
    approvalThreshold: number;
    voters: VoterRecord[];
    finalResult?: {
        approved: boolean;
        participationRate: number;
        approvalRate: number;
    };
}

export interface AssociationRequest {
    id: string;
    walletAddress: string;
    organizationName: string;
    email: string;
    description: string;
    website?: string;
    proofDocuments: string[];
    reason: string;
    status: AssociationRequestStatus;
    submittedAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    rejectionReason?: string;
}

export interface VotingPowerBreakdown {
    totalPower: number;
    badges: {
        tier: BadgeTier;
        count: number;
        powerPerBadge: number;
        totalPower: number;
    }[];
}

export interface GovernanceStats {
    activeVotes: number;
    completedVotes: number;
    averageApprovalRate: number;
    averageParticipationRate: number;
    totalVotingPower: number;
    votingPowerByTier: Record<BadgeTier, number>;
    topVoters: {
        walletAddress: string;
        totalVotes: number;
        projectsVoted: number;
        votingPower: number;
    }[];
}

/**
 * Calcule le pouvoir de vote total d'un utilisateur basé sur ses badges
 */
export function calculateVotingPower(badges: Badge[]): number {
    return badges
        .filter(badge => badge.unlocked && badge.count > 0)
        .reduce((total, badge) => {
            const weight = VOTING_POWER_WEIGHTS[badge.tier];
            return total + (weight * badge.count);
        }, 0);
}

/**
 * Calcule la répartition détaillée du pouvoir de vote
 */
export function getVotingPowerBreakdown(badges: Badge[]): VotingPowerBreakdown {
    const breakdown: VotingPowerBreakdown = {
        totalPower: 0,
        badges: []
    };

    const tierGroups = badges
        .filter(badge => badge.unlocked && badge.count > 0)
        .reduce((acc, badge) => {
            const tier = badge.tier;
            if (!acc[tier]) {
                acc[tier] = { count: 0, tier };
            }
            acc[tier].count += badge.count;
            return acc;
        }, {} as Record<BadgeTier, { count: number; tier: BadgeTier }>);

    Object.values(tierGroups).forEach(group => {
        const powerPerBadge = VOTING_POWER_WEIGHTS[group.tier];
        const totalPower = powerPerBadge * group.count;

        breakdown.badges.push({
            tier: group.tier,
            count: group.count,
            powerPerBadge,
            totalPower
        });

        breakdown.totalPower += totalPower;
    });

    return breakdown;
}

/**
 * Vérifie si un vote a atteint le quorum
 */
export function hasReachedQuorum(vote: ProjectVote): boolean {
    const totalVotes = vote.votesFor + vote.votesAgainst + vote.abstentions;
    return totalVotes >= vote.quorumThreshold;
}

/**
 * Calcule le taux de participation
 */
export function getParticipationRate(vote: ProjectVote): number {
    const totalVotes = vote.votesFor + vote.votesAgainst + vote.abstentions;
    return (totalVotes / vote.totalVotingPower) * 100;
}

/**
 * Calcule le taux d'approbation (hors abstentions)
 */
export function getApprovalRate(vote: ProjectVote): number {
    const expressedVotes = vote.votesFor + vote.votesAgainst;
    if (expressedVotes === 0) return 0;
    return (vote.votesFor / expressedVotes) * 100;
}

/**
 * Détermine si un vote est approuvé
 */
export function isVoteApproved(vote: ProjectVote): boolean {
    if (!hasReachedQuorum(vote)) return false;
    return getApprovalRate(vote) >= vote.approvalThreshold;
}

/**
 * Calcule le temps restant pour voter (en millisecondes)
 */
export function getTimeRemaining(vote: ProjectVote): number {
    const endTime = new Date(vote.endDate).getTime();
    const now = Date.now();
    return Math.max(0, endTime - now);
}

/**
 * Vérifie si un utilisateur a déjà voté
 */
export function hasUserVoted(vote: ProjectVote, walletAddress: string): boolean {
    return vote.voters.some(
        v => v.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
}

/**
 * Récupère le vote d'un utilisateur
 */
export function getUserVote(vote: ProjectVote, walletAddress: string): VoterRecord | undefined {
    return vote.voters.find(
        v => v.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
}
