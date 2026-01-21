import type { AssociationRequest, ProjectVote, VoteChoice, Badge } from '../types/governance';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ========================================
// 🔧 DEV MODE
// ========================================
const DEV_MODE = true;

// Mock data for dev mode
const MOCK_BADGES: Badge[] = [
    { id: 1, name: 'Early Supporter', tier: 'Common', count: 2, unlocked: true, description: 'Donated to your first project' },
    { id: 2, name: 'Major Donor', tier: 'Rare', count: 1, unlocked: true, description: 'Donated more than 1 ETH' },
];

const MOCK_ASSOCIATION_REQUESTS: AssociationRequest[] = [
    {
        id: '1',
        walletAddress: '0x123...',
        organizationName: 'Green Earth Foundation',
        email: 'contact@greenearth.org',
        description: 'Environmental protection organization',
        website: 'https://greenearth.org',
        proofDocuments: [],
        reason: 'We want to raise funds for reforestation projects',
        status: 'Pending',
        submittedAt: new Date().toISOString(),
    },
    {
        id: '2',
        walletAddress: '0x456...',
        organizationName: 'Education For All',
        email: 'info@eduforall.org',
        description: 'Education-focused charity',
        website: 'https://eduforall.org',
        proofDocuments: [],
        reason: 'We want to fund scholarships for underprivileged students',
        status: 'Pending',
        submittedAt: new Date().toISOString(),
    },
];

const MOCK_ACTIVE_VOTES: ProjectVote[] = [
    {
        projectId: 1,
        votesFor: 150,
        votesAgainst: 25,
        abstentions: 10,
        totalVotingPower: 500,
        quorumThreshold: 100,
        approvalThreshold: 60,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        voters: [],
    },
    {
        projectId: 2,
        votesFor: 230,
        votesAgainst: 15,
        abstentions: 5,
        totalVotingPower: 600,
        quorumThreshold: 100,
        approvalThreshold: 60,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        voters: [],
    },
];

export const governanceService = {
    async submitAssociationRequest(data: {
        organizationName: string;
        email: string;
        description: string;
        website?: string;
        proofDocuments: string[];
        reason: string;
    }): Promise<AssociationRequest> {
        if (DEV_MODE) {
            console.log('🔧 DEV MODE: Would submit association request:', data);
            return {
                id: Date.now().toString(),
                walletAddress: '0x...',
                ...data,
                status: 'Pending',
                submittedAt: new Date().toISOString(),
            };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/association-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit request');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting association request:', error);
            throw error;
        }
    },

    async getAssociationRequests(status?: string): Promise<AssociationRequest[]> {
        if (DEV_MODE) {
            console.log('🔧 DEV MODE: Returning mock association requests');
            if (status) {
                return MOCK_ASSOCIATION_REQUESTS.filter(r => r.status === status);
            }
            return MOCK_ASSOCIATION_REQUESTS;
        }

        try {
            const url = status
                ? `${API_BASE_URL}/admin/association-requests?status=${status}`
                : `${API_BASE_URL}/admin/association-requests`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch requests');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching association requests:', error);
            throw error;
        }
    },

    async approveAssociationRequest(requestId: string, notes?: string): Promise<AssociationRequest> {
        if (DEV_MODE) {
            console.log(`🔧 DEV MODE: Would approve request ${requestId} with notes: ${notes}`);
            const request = MOCK_ASSOCIATION_REQUESTS.find(r => r.id === requestId);
            return { ...request!, status: 'Approved', reviewedAt: new Date().toISOString() };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/association-requests/${requestId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notes }),
            });

            if (!response.ok) {
                throw new Error('Failed to approve request');
            }

            return await response.json();
        } catch (error) {
            console.error('Error approving request:', error);
            throw error;
        }
    },

    async rejectAssociationRequest(requestId: string, reason: string): Promise<AssociationRequest> {
        if (DEV_MODE) {
            console.log(`🔧 DEV MODE: Would reject request ${requestId} with reason: ${reason}`);
            const request = MOCK_ASSOCIATION_REQUESTS.find(r => r.id === requestId);
            return { ...request!, status: 'Rejected', reviewedAt: new Date().toISOString(), rejectionReason: reason };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/association-requests/${requestId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            });

            if (!response.ok) {
                throw new Error('Failed to reject request');
            }

            return await response.json();
        } catch (error) {
            console.error('Error rejecting request:', error);
            throw error;
        }
    },

    async getProjectVote(projectId: number): Promise<ProjectVote | null> {
        if (DEV_MODE) {
            console.log(`🔧 DEV MODE: Returning mock vote for project ${projectId}`);
            return MOCK_ACTIVE_VOTES.find(v => v.projectId === projectId) || null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/vote-status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error('Failed to fetch vote status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching vote status:', error);
            return null;
        }
    },

    async submitVote(projectId: number, vote: VoteChoice): Promise<{ success: boolean; votingPower: number }> {
        if (DEV_MODE) {
            console.log(`🔧 DEV MODE: Would submit vote ${vote} for project ${projectId}`);
            return { success: true, votingPower: 4 };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vote }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit vote');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting vote:', error);
            throw error;
        }
    },

    async getUserBadges(walletAddress: string): Promise<Badge[]> {
        if (DEV_MODE) {
            console.log(`🔧 DEV MODE: Returning mock badges for ${walletAddress}`);
            return MOCK_BADGES;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/badges/${walletAddress}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error('Failed to fetch badges');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching badges:', error);
            return [];
        }
    },

    async getActiveVotes(): Promise<ProjectVote[]> {
        if (DEV_MODE) {
            console.log('🔧 DEV MODE: Returning mock active votes');
            return MOCK_ACTIVE_VOTES;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/governance/active-votes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch active votes');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching active votes:', error);
            return [];
        }
    },
};
