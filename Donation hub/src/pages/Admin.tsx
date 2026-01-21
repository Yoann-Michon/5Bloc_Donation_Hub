import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Button,
    Stack,
    Chip,
} from '@mui/material';
import { Add, PendingActions, CheckCircle, List } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useRole } from '../context/RoleContext';
import { ProjectApprovalCard } from '../component/admin/ProjectApprovalCard';

const Admin = () => {
    const navigate = useNavigate();
    const { isAdmin } = useRole();
    const { projects, pendingProjects, approvedProjects, approveProject, rejectProject, deleteProject } = useProjects();
    const [currentTab, setCurrentTab] = useState(0);

    if (!isAdmin) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h4" color="error">
                    Access Denied
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    You need admin privileges to access this page.
                </Typography>
            </Container>
        );
    }

    const stats = [
        { label: 'Total Projects', value: projects.length, color: 'primary' },
        { label: 'Pending', value: pendingProjects.length, color: 'warning' },
        { label: 'Approved', value: approvedProjects.length, color: 'success' },
    ];

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const filteredProjects = () => {
        switch (currentTab) {
            case 0:
                return pendingProjects;
            case 1:
                return approvedProjects;
            case 2:
                return projects;
            default:
                return projects;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage projects and approvals
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/dashboard/admin/projects/new')}
                >
                    Create Project
                </Button>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Box
                        key={stat.label}
                        sx={{
                            flex: 1,
                            p: 3,
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {stat.label}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                            {stat.value}
                        </Typography>
                    </Box>
                ))}
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab
                        icon={<PendingActions />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Pending Approval
                                {pendingProjects.length > 0 && (
                                    <Chip label={pendingProjects.length} size="small" color="warning" />
                                )}
                            </Box>
                        }
                    />
                    <Tab icon={<CheckCircle />} iconPosition="start" label="Approved" />
                    <Tab icon={<List />} iconPosition="start" label="All Projects" />
                </Tabs>
            </Box>

            <Stack spacing={2}>
                {filteredProjects().length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No projects in this category</Typography>
                    </Box>
                ) : (
                    filteredProjects().map((project) => (
                        <ProjectApprovalCard
                            key={project.id}
                            project={project}
                            onApprove={approveProject}
                            onReject={rejectProject}
                            onEdit={(id) => navigate(`/dashboard/admin/projects/${id}/edit`)}
                            onDelete={deleteProject}
                        />
                    ))
                )}
            </Stack>
        </Container>
    );
};

export default Admin;
