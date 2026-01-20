import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { UserRole, type User } from '../types/user';
import { ADMIN_WALLETS, PERMISSIONS } from '../config/roles';
import usersData from '../data/users.json';
import { useWallet } from '../hooks/useWallet';

interface RoleContextType {
    currentRole: UserRole;
    isAdmin: boolean;
    isAssociation: boolean;
    canEditProject: (projectOwnerWallet: string) => boolean;
    canDeleteProject: (projectOwnerWallet: string) => boolean;
    canApproveProjects: () => boolean;
    canCreateProject: () => boolean;
    requiresApproval: () => boolean;
    getUserRole: (walletAddress: string) => UserRole;
    getUser: (walletAddress: string) => User | undefined;
    updateUserRole: (walletAddress: string, role: UserRole) => Promise<void>;
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
    const [users, setUsers] = useState<User[]>(usersData as User[]);

    const getUserRole = useCallback((walletAddress: string): UserRole => {
        if (!walletAddress) return UserRole.USER;

        const normalizedAddress = walletAddress.toLowerCase();

        if (ADMIN_WALLETS.some(admin => admin.toLowerCase() === normalizedAddress)) {
            return UserRole.ADMIN;
        }

        const user = users.find(u => u.walletAddress.toLowerCase() === normalizedAddress);
        return user ? user.role : UserRole.USER;
    }, [users]);

    const getUser = useCallback((walletAddress: string): User | undefined => {
        if (!walletAddress) return undefined;
        const normalizedAddress = walletAddress.toLowerCase();
        return users.find(u => u.walletAddress.toLowerCase() === normalizedAddress);
    }, [users]);

    const currentRole = account ? getUserRole(account) : UserRole.USER;
    const isAdmin = currentRole === UserRole.ADMIN;
    const isAssociation = currentRole === UserRole.ASSOCIATION;

    const canEditProject = useCallback((projectOwnerWallet: string): boolean => {
        if (!account) return false;
        if (isAdmin) return true;
        if (isAssociation) {
            return account.toLowerCase() === projectOwnerWallet.toLowerCase();
        }
        return false;
    }, [account, isAdmin, isAssociation]);

    const canDeleteProject = useCallback((projectOwnerWallet: string): boolean => {
        if (!account) return false;
        if (isAdmin) return true;
        if (isAssociation) {
            return account.toLowerCase() === projectOwnerWallet.toLowerCase();
        }
        return false;
    }, [account, isAdmin, isAssociation]);

    const canApproveProjects = useCallback((): boolean => {
        return PERMISSIONS[currentRole]?.canApproveProjects || false;
    }, [currentRole]);

    const canCreateProject = useCallback((): boolean => {
        return PERMISSIONS[currentRole]?.canCreateProject || false;
    }, [currentRole]);

    const requiresApproval = useCallback((): boolean => {
        return PERMISSIONS[currentRole]?.requiresApproval || false;
    }, [currentRole]);

    const updateUserRole = useCallback(async (walletAddress: string, role: UserRole): Promise<void> => {
        if (!isAdmin) {
            throw new Error('Only admins can update user roles');
        }

        const userIndex = users.findIndex(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase());

        if (userIndex >= 0) {
            const updatedUsers = [...users];
            updatedUsers[userIndex] = {
                ...updatedUsers[userIndex],
                role,
            };
            setUsers(updatedUsers);
        } else {
            const newUser: User = {
                walletAddress,
                role,
                approvedAt: new Date().toISOString(),
                approvedBy: account || undefined,
            };
            setUsers([...users, newUser]);
        }
    }, [isAdmin, users, account]);

    return (
        <RoleContext.Provider
            value={{
                currentRole,
                isAdmin,
                isAssociation,
                canEditProject,
                canDeleteProject,
                canApproveProjects,
                canCreateProject,
                requiresApproval,
                getUserRole,
                getUser,
                updateUserRole,
            }}
        >
            {children}
        </RoleContext.Provider>
    );
};
