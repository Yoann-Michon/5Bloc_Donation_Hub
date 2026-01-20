export const UserRole = {
    ADMIN: 'ADMIN',
    ASSOCIATION: 'ASSOCIATION',
    USER: 'USER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
    walletAddress: string;
    role: UserRole;
    organizationName?: string;
    email?: string;
    approvedAt?: string;
    approvedBy?: string;
}
