import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

const transformProject = (p: any) => ({
    ...p,
    id: Number(p.id),
    author: p.owner?.organizationName || p.owner?.walletAddress || p.ownerWallet,
    backers: p.donations?.length || 0,
    daysLeft: 30, // Default or calculate from createdAt
    raised: Number(p.raised),
    goal: Number(p.goal),
    image: p.image || '', // Ensure valid string
});

export const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data.map(transformProject);
};

export const getProject = async (id: number) => {
    const response = await api.get(`/projects/${id}`);
    return transformProject(response.data);
};

export const createProject = async (data: any) => {
    const response = await api.post('/projects', data);
    return response.data;
};

export const createDonation = async (data: any) => {
    const response = await api.post('/donations', data);
    return response.data;
};

export default api;
