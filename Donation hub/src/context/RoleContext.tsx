import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { UserRole, type User, type UserPermissions } from '../types/user';
import { FALLBACK_PERMISSIONS } from '../config/roles';
import { userService } from '../services/userService';
import { useWallet } from '../hooks/useWallet';

interface RoleContextType {
    currentRole: UserRole;
    currentUser: User | null;
    permissions: UserPermissions;
    isAdmin: boolean;
    isAssociation: boolean;
    isLoading: boolean;
    hasPermission: (permission: keyof UserPermissions) => boolean;
    canEditProject: (projectOwnerWallet: string) => boolean;
    canDeleteProject: (projectOwnerWallet: string) => boolean;
    refreshPermissions: () => Promise<void>;
    updateUserRole: (walletAddress: string, role: UserRole) => Promise<void>;
    setDevRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within RoleProvider');
    }
    return context;
};

interface RoleProviderProps {
    children: ReactNode;
}

export const RoleProvider = ({ children }: RoleProviderProps) => {
    const { account } = useWallet();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<UserPermissions>(FALLBACK_PERMISSIONS);
    const [isLoading, setIsLoading] = useState(false);
    const [devRole, setDevRole] = useState<UserRole | null>(null);

    useEffect(() => {
        if (import.meta.env.MODE === 'development') {
            const savedRole = localStorage.getItem('dev_role') as UserRole | null;
            if (savedRole) {
                setDevRole(savedRole);
            }
        }
    }, []);

    const fetchUserData = useCallback(async (walletAddress: string) => {
        setIsLoading(true);
        try {
            const user = await userService.getUserByWallet(walletAddress);

            if (user) {
                setCurrentUser(user);

                if (user.permissions) {
                    setPermissions(user.permissions);
                } else {
                    console.warn('User has no permissions from backend, using fallback');
                    setPermissions(FALLBACK_PERMISSIONS);
                }
            } else {
                console.warn('User not found in backend, using fallback permissions');
                const defaultUser: User = {
                    walletAddress,
                    role: UserRole.USER,
                    permissions: FALLBACK_PERMISSIONS,
                };
                setCurrentUser(defaultUser);
                setPermissions(FALLBACK_PERMISSIONS);
            }
        } catch (error) {
            console.error('Error fetching user data from backend:', error);
            console.warn('Using fallback permissions - backend may be unavailable');
            const fallbackUser: User = {
                walletAddress,
                role: UserRole.USER,
                permissions: FALLBACK_PERMISSIONS,
            };
            setCurrentUser(fallbackUser);
            setPermissions(FALLBACK_PERMISSIONS);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshPermissions = useCallback(async () => {
        if (account) {
            await fetchUserData(account);
        }
    }, [account, fetchUserData]);

    useEffect(() => {
        if (account) {
            fetchUserData(account);
        } else {
            setCurrentUser(null);
            setPermissions(FALLBACK_PERMISSIONS);
        }
    }, [account, fetchUserData]);

    const effectiveRole = (import.meta.env.MODE === 'development' && devRole) ? devRole : (currentUser?.role || UserRole.USER);

    useEffect(() => {
        if (import.meta.env.MODE === 'development' && devRole) {
            const devPermissions: UserPermissions = {
                canCreateProject: devRole === UserRole.ADMIN || devRole === UserRole.ASSOCIATION,
                canEditProject: devRole === UserRole.ADMIN || devRole === UserRole.ASSOCIATION,
                canDeleteProject: devRole === UserRole.ADMIN || devRole === UserRole.ASSOCIATION,
                canApproveProjects: devRole === UserRole.ADMIN,
                canManageRoles: devRole === UserRole.ADMIN,
                canManageUsers: devRole === UserRole.ADMIN,
                canViewAnalytics: devRole === UserRole.ADMIN,
                canWithdrawFunds: devRole === UserRole.ADMIN || devRole === UserRole.ASSOCIATION,
            };
            setPermissions(devPermissions);
        }
    }, [devRole]);

    const currentRole = effectiveRole;
    const isAdmin = currentRole === UserRole.ADMIN;
    const isAssociation = currentRole === UserRole.ASSOCIATION;

    const handleDevRoleChange = useCallback((role: UserRole) => {
        if (import.meta.env.MODE === 'development') {
            setDevRole(role);
            localStorage.setItem('dev_role', role);

            // Update permissions immediately
            const devPermissions: UserPermissions = {
                canCreateProject: role === UserRole.ADMIN || role === UserRole.ASSOCIATION,
                canEditProject: role === UserRole.ADMIN || role === UserRole.ASSOCIATION,
                canDeleteProject: role === UserRole.ADMIN || role === UserRole.ASSOCIATION,
                canApproveProjects: role === UserRole.ADMIN,
                canManageRoles: role === UserRole.ADMIN,
                canManageUsers: role === UserRole.ADMIN,
                canViewAnalytics: role === UserRole.ADMIN,
                canWithdrawFunds: role === UserRole.ADMIN || role === UserRole.ASSOCIATION,
            };
            setPermissions(devPermissions);

            if (currentUser) {
                setCurrentUser({ ...currentUser, role, permissions: devPermissions });
            }
        }
    }, [currentUser]);

    const hasPermission = useCallback((permission: keyof UserPermissions): boolean => {
        return permissions[permission] || false;
    }, [permissions]);

    const canEditProject = useCallback((projectOwnerWallet: string): boolean => {
        if (!account) return false;

        if (hasPermission('canEditProject')) {
            if (isAdmin) return true;
            if (isAssociation) {
                return account.toLowerCase() === projectOwnerWallet.toLowerCase();
            }
        }
        return false;
    }, [account, isAdmin, isAssociation, hasPermission]);

    const canDeleteProject = useCallback((projectOwnerWallet: string): boolean => {
        if (!account) return false;

        if (hasPermission('canDeleteProject')) {
            if (isAdmin) return true;
            if (isAssociation) {
                return account.toLowerCase() === projectOwnerWallet.toLowerCase();
            }
        }
        return false;
    }, [account, isAdmin, isAssociation, hasPermission]);

    const updateUserRole = useCallback(async (walletAddress: string, role: UserRole): Promise<void> => {
        if (!hasPermission('canManageRoles')) {
            throw new Error('You do not have permission to update user roles');
        }

        if (!account) {
            throw new Error('No wallet connected');
        }

        try {
            await userService.updateUserRole(walletAddress, role, account);

            if (walletAddress.toLowerCase() === account.toLowerCase()) {
                await refreshPermissions();
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }, [account, hasPermission, refreshPermissions]);

    return (
        <RoleContext.Provider
            value={{
                currentRole,
                currentUser,
                permissions,
                isAdmin,
                isAssociation,
                isLoading,
                hasPermission,
                canEditProject,
                canDeleteProject,
                refreshPermissions,
                updateUserRole,
                setDevRole: handleDevRoleChange,
            }}
        >
            {children}
        </RoleContext.Provider>
    );
};
