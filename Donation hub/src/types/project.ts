export type ProjectStatus = 'Draft' | 'Pending' | 'Approved' | 'Fundraising' | 'Completed' | 'Rejected';

export interface Project {
    id: number;
    title: string;
    description: string;
    image: string;
    author: string;
    ownerWallet: string;
    raised: number;
    goal: number;
    category: string;
    backers: number;
    daysLeft: number;
    status: ProjectStatus;
    createdAt?: string;
    approvedBy?: string;
    approvedAt?: string;
}
