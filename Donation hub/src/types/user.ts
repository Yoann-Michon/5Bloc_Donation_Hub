export const UserRole = {
    ADMIN: 'ADMIN',
    ASSOCIATION: 'ASSOCIATION',
    USER: 'USER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface UserPermissions {
    canCreateProject: boolean;
    canEditProject: boolean;
    canDeleteProject: boolean;
    canApproveProjects: boolean;
    canManageRoles: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canWithdrawFunds: boolean;
    [key: string]: boolean;
}

export interface User {
    walletAddress: string;
    role: UserRole;
    permissions?: UserPermissions;
    organizationName?: string;
    email?: string;
    approvedAt?: string;
    approvedBy?: string;
}
