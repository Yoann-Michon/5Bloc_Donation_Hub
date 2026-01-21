import { type UserPermissions } from '../types/user';

export const FALLBACK_PERMISSIONS: UserPermissions = {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canApproveProjects: false,
    canManageRoles: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canWithdrawFunds: false,
};

/**
 * Note: Ce fichier ne devrait contenir AUCUNE logique de permissions.
 * Les permissions réelles doivent être récupérées depuis:
 * - Backend API: src/services/userService.ts
 * - Context: src/context/RoleContext.tsx
 */
