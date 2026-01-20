import { useState, useCallback, useMemo } from 'react';
import type { Project, ProjectStatus } from '../types/project';
import projectsData from '../data/projects.json';
import { useRole } from '../context/RoleContext';
import { useWallet } from './useWallet';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>(projectsData as Project[]);
    const { isAdmin, canEditProject, canDeleteProject } = useRole();
    const { account } = useWallet();

    const myProjects = useMemo(() => {
        if (!account) return [];
        return projects.filter(p => p.ownerWallet.toLowerCase() === account.toLowerCase());
    }, [projects, account]);

    const pendingProjects = useMemo(() => {
        return projects.filter(p => p.status === 'Pending');
    }, [projects]);

    const approvedProjects = useMemo(() => {
        return projects.filter(p => p.status === 'Approved' || p.status === 'Fundraising');
    }, [projects]);

    const getProjectById = useCallback((id: number): Project | undefined => {
        return projects.find(p => p.id === id);
    }, [projects]);

    const canEdit = useCallback((project: Project): boolean => {
        return canEditProject(project.ownerWallet);
    }, [canEditProject]);

    const canDelete = useCallback((project: Project): boolean => {
        return canDeleteProject(project.ownerWallet);
    }, [canDeleteProject]);

    const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'ownerWallet' | 'status' | 'createdAt'>): Promise<Project> => {
        if (!account) {
            throw new Error('Wallet not connected');
        }

        const newProject: Project = {
            ...projectData,
            id: Math.max(...projects.map(p => p.id), 0) + 1,
            ownerWallet: account,
            status: isAdmin ? 'Approved' : 'Pending',
            createdAt: new Date().toISOString(),
            approvedBy: isAdmin ? account : undefined,
            approvedAt: isAdmin ? new Date().toISOString() : undefined,
        };

        setProjects([...projects, newProject]);
        return newProject;
    }, [projects, account, isAdmin]);

    const updateProject = useCallback(async (id: number, updates: Partial<Project>): Promise<Project | null> => {
        const project = getProjectById(id);
        if (!project) return null;

        if (!canEditProject(project.ownerWallet)) {
            throw new Error('Permission denied');
        }

        const updatedProjects = projects.map(p =>
            p.id === id ? { ...p, ...updates } : p
        );
        setProjects(updatedProjects);

        return updatedProjects.find(p => p.id === id) || null;
    }, [projects, getProjectById, canEditProject]);

    const deleteProject = useCallback(async (id: number): Promise<boolean> => {
        const project = getProjectById(id);
        if (!project) return false;

        if (!canDeleteProject(project.ownerWallet)) {
            throw new Error('Permission denied');
        }

        setProjects(projects.filter(p => p.id !== id));
        return true;
    }, [projects, getProjectById, canDeleteProject]);

    const approveProject = useCallback(async (id: number): Promise<Project | null> => {
        if (!isAdmin) {
            throw new Error('Only admins can approve projects');
        }

        const project = getProjectById(id);
        if (!project) return null;

        const updatedProject = {
            ...project,
            status: 'Approved' as ProjectStatus,
            approvedBy: account || undefined,
            approvedAt: new Date().toISOString(),
        };

        const updatedProjects = projects.map(p =>
            p.id === id ? updatedProject : p
        );
        setProjects(updatedProjects);

        return updatedProject;
    }, [projects, isAdmin, account, getProjectById]);

    const rejectProject = useCallback(async (id: number): Promise<Project | null> => {
        if (!isAdmin) {
            throw new Error('Only admins can reject projects');
        }

        const project = getProjectById(id);
        if (!project) return null;

        const updatedProject = {
            ...project,
            status: 'Rejected' as ProjectStatus,
        };

        const updatedProjects = projects.map(p =>
            p.id === id ? updatedProject : p
        );
        setProjects(updatedProjects);

        return updatedProject;
    }, [projects, isAdmin, getProjectById]);

    return {
        projects,
        myProjects,
        pendingProjects,
        approvedProjects,
        getProjectById,
        canEdit,
        canDelete,
        createProject,
        updateProject,
        deleteProject,
        approveProject,
        rejectProject,
    };
};
