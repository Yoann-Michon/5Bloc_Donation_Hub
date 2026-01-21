import { UserRole, type User, type UserPermissions } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ========================================
// 🔧 DEV MODE
// ========================================
const DEV_MODE = true;

const getDevRole = (): UserRole => {
    if (typeof window !== 'undefined') {
        const savedRole = localStorage.getItem('dev_role') as UserRole | null;
        return savedRole || UserRole.USER;
    }
    return UserRole.USER;
};

const MOCK_PERMISSIONS: Record<UserRole, UserPermissions> = {
    ADMIN: {
        canCreateProject: true,
        canEditProject: true,
        canDeleteProject: true,
        canApproveProjects: true,
        canManageRoles: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canWithdrawFunds: true,
    },
    ASSOCIATION: {
        canCreateProject: true,
        canEditProject: true,
        canDeleteProject: true,
        canApproveProjects: false,
        canManageRoles: false,
        canManageUsers: false,
        canViewAnalytics: true,
        canWithdrawFunds: false,
    },
    USER: {
        canCreateProject: false,
        canEditProject: false,
        canDeleteProject: false,
        canApproveProjects: false,
        canManageRoles: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canWithdrawFunds: false,
    },
};

const getMockUser = (walletAddress: string): User => {
    const role = getDevRole();
    return {
        walletAddress,
        role,
        permissions: MOCK_PERMISSIONS[role],
        organizationName: role === 'ADMIN' ? 'Platform Admin' : role === 'ASSOCIATION' ? 'Test Association' : undefined,
        email: 'dev@test.com',
        approvedAt: new Date().toISOString(),
    };
};

export const userService = {
    async getUserByWallet(walletAddress: string): Promise<User | null> {
        if (DEV_MODE) {
            const role = getDevRole();
            console.log(`🔧 DEV MODE: Returning mock user with role ${role}`);
            return getMockUser(walletAddress);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${walletAddress}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to fetch user: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    },

    async getUserPermissions(walletAddress: string): Promise<UserPermissions | null> {
        if (DEV_MODE) {
            const role = getDevRole();
            return MOCK_PERMISSIONS[role];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/permissions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to fetch permissions: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching permissions:', error);
            return null;
        }
    },

    async updateUserRole(walletAddress: string, role: string, adminWallet: string): Promise<User> {
        if (DEV_MODE) {
            console.log(`🔧 DEV MODE: Would update ${walletAddress} to role ${role}`);
            return getMockUser(walletAddress);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role, adminWallet }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update role: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    },

    async checkPermission(walletAddress: string, permission: string): Promise<boolean> {
        if (DEV_MODE) {
            const role = getDevRole();
            return MOCK_PERMISSIONS[role][permission] || false;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/users/${walletAddress}/check-permission/${permission}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return data.hasPermission || false;
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    },
};
