import axios from 'axios';
import type {
    ApiUser,
    ApiProject,
    ApiDonation,
    ApiCategory,
    CreateUserDto,
    UpdateUserDto,
    CreateProjectDto,
    UpdateProjectDto,
    CreateDonationDto,
    UpdateDonationDto,
    CreateCategoryDto,
    UpdateCategoryDto,
} from '../types';

export * from '../types';
export * from '../types/enums';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt_token');
        }
        return Promise.reject(error);
    }
);

const transformProject = (p: any) => ({
    ...p,
    id: Number(p.id),
    author: p.owner?.organizationName || p.owner?.walletAddress || p.ownerWallet,
    backers: p.donations?.length || 0,
    daysLeft: 30,
    raised: Number(p.raised),
    goal: Number(p.goal),
    image: p.image || '',
    category: p.category?.name || p.categoryId || 'Uncategorized',
});

export const getUsers = async (): Promise<ApiUser[]> => {
    const response = await api.get('/users');
    return response.data;
};

export const createUser = async (data: CreateUserDto): Promise<ApiUser> => {
    const response = await api.post('/users', data);
    return response.data;
};

export const getUser = async (id: string): Promise<ApiUser> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const updateUser = async (id: string, data: UpdateUserDto): Promise<ApiUser> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
};

export const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data.map(transformProject);
};

export const createProject = async (data: CreateProjectDto): Promise<ApiProject> => {
    const response = await api.post('/projects', data);
    return response.data;
};

export const getProject = async (id: number) => {
    const response = await api.get(`/projects/${id}`);
    return transformProject(response.data);
};

export const updateProject = async (id: number, data: UpdateProjectDto): Promise<ApiProject> => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
};

export const getDonations = async (): Promise<ApiDonation[]> => {
    const response = await api.get('/donations');
    return response.data;
};

export const createDonation = async (data: CreateDonationDto): Promise<ApiDonation> => {
    const response = await api.post('/donations', data);
    return response.data;
};

export const getDonation = async (id: string): Promise<ApiDonation> => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
};

export const updateDonation = async (id: string, data: UpdateDonationDto): Promise<ApiDonation> => {
    const response = await api.patch(`/donations/${id}`, data);
    return response.data;
};

export const deleteDonation = async (id: string): Promise<void> => {
    await api.delete(`/donations/${id}`);
};

export const getCategories = async (): Promise<ApiCategory[]> => {
    const response = await api.get('/categories');
    return response.data;
};

export const createCategory = async (data: CreateCategoryDto): Promise<ApiCategory> => {
    const response = await api.post('/categories', data);
    return response.data;
};

export const getCategory = async (id: string): Promise<ApiCategory> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
};

export const getCategoryBySlug = async (slug: string): Promise<ApiCategory> => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<ApiCategory> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
};

export const getNonce = async (walletAddress: string): Promise<{ nonce: string }> => {
    const response = await api.get(`/auth/nonce?walletAddress=${walletAddress}`);
    return response.data;
};

export const verifySignature = async (walletAddress: string, signature: string): Promise<{ accessToken: string; user: any }> => {
    const response = await api.post('/auth/verify', { walletAddress, signature });
    return response.data;
};

export const getCurrentUser = async (): Promise<any> => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const getUserBadges = async (walletAddress: string) => {
    const response = await api.get(`/badges/${walletAddress}`);
    return response.data;
};

export const syncUserBadges = async (walletAddress: string) => {
    const response = await api.post(`/badges/${walletAddress}/sync`);
    return response.data;
};

export const getUserTier = async (walletAddress: string) => {
    const response = await api.get(`/badges/${walletAddress}/tier`);
    return response.data;
};

export const getPrivileges = async () => {
    const response = await api.get('/privileges');
    return response.data;
};

export default api;
