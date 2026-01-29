import { UserRole, ProjectStatus } from './enums';

export interface ApiUser {
    id: string;
    walletAddress: string;
    role: UserRole;
    organizationName?: string;
    email?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiProject {
    id: number;
    title: string;
    description: string;
    goal: string;
    raised: string;
    category: string;
    image?: string;
    status: ProjectStatus;
    ownerWallet: string;
    owner?: ApiUser;
    approvedBy?: string;
    approvedAt?: string;
    donations?: ApiDonation[];
    createdAt: string;
    updatedAt: string;
}

export interface ApiDonation {
    id: string;
    amount: string;
    txHash: string;
    donorWallet: string;
    donor?: ApiUser;
    projectId: number;
    project?: ApiProject;
    createdAt: string;
}

export interface ApiCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        projects: number;
    };
}

export interface CreateUserDto {
    walletAddress: string;
    role?: UserRole;
    organizationName?: string;
    email?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> { }

export interface CreateProjectDto {
    title: string;
    description: string;
    goal: string;
    category: string;
    image?: string;
    ownerWallet: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
    status?: ProjectStatus;
    approvedBy?: string;
}

export interface CreateDonationDto {
    amount: string;
    txHash: string;
    donorWallet: string;
    projectId: number;
}

export interface UpdateDonationDto extends Partial<CreateDonationDto> { }

export interface CreateCategoryDto {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> { }
