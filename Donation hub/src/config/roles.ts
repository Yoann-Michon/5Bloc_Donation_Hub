import { UserRole } from '../types/user';

export const ADMIN_WALLETS = [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
];

export const PERMISSIONS = {
    [UserRole.ADMIN]: {
        canCreateProject: true,
        canEditAnyProject: true,
        canDeleteAnyProject: true,
        canApproveProjects: true,
        canManageRoles: true,
        requiresApproval: false,
    },
    [UserRole.ASSOCIATION]: {
        canCreateProject: true,
        canEditOwnProjects: true,
        canDeleteOwnProjects: true,
        canApproveProjects: false,
        canManageRoles: false,
        requiresApproval: true,
    },
    [UserRole.USER]: {
        canCreateProject: false,
        canEditProjects: false,
        canDeleteProjects: false,
        canApproveProjects: false,
        canManageRoles: false,
        requiresApproval: false,
    },
} as const;
