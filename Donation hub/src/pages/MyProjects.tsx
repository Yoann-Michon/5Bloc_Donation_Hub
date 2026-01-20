import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Tabs,
    Tab,
    Chip,
} from '@mui/material';
import { Add, Drafts, PendingActions, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useRole } from '../context/RoleContext';
import { useWallet } from '../hooks/useWallet';
import { ProjectApprovalCard } from '../component/admin/ProjectApprovalCard';

const MyProjects = () => {
    const navigate = useNavigate();
    const { isAssociation, isAdmin } = useRole();
    const { isConnected } = useWallet();
    const { myProjects, deleteProject } = useProjects();
    const [currentTab, setCurrentTab] = useState(0);

    if (!isConnected) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h4" color="text.secondary">
                    Connect Your Wallet
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Please connect your wallet to view your projects.
                </Typography>
            </Container>
        );
    }

    if (!isAssociation && !isAdmin) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h4" color="error">
                    Access Denied
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    You need association or admin privileges to access this page.
                </Typography>
            </Container>
        );
    }

    const draftProjects = myProjects.filter(p => p.status === 'Draft');
    const pendingProjects = myProjects.filter(p => p.status === 'Pending');
    const approvedProjects = myProjects.filter(p => p.status === 'Approved' || p.status === 'Fundraising');
    const rejectedProjects = myProjects.filter(p => p.status === 'Rejected');

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const filteredProjects = () => {
        switch (currentTab) {
            case 0:
                return myProjects;
            case 1:
                return draftProjects;
            case 2:
                return pendingProjects;
            case 3:
                return approvedProjects;
            default:
                return myProjects;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        My Projects
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your organization's projects
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/my-projects/new')}
                >
                    New Project
                </Button>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Box
                    sx={{
                        flex: 1,
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Total Projects
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {myProjects.length}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Pending Review
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {pendingProjects.length}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Active
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {approvedProjects.length}
                    </Typography>
                </Box>
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                All
                                <Chip label={myProjects.length} size="small" />
                            </Box>
                        }
                    />
                    <Tab
                        icon={<Drafts />}
                        iconPosition="start"
                        label="Drafts"
                    />
                    <Tab
                        icon={<PendingActions />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Pending
                                {pendingProjects.length > 0 && (
                                    <Chip label={pendingProjects.length} size="small" color="warning" />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        icon={<CheckCircle />}
                        iconPosition="start"
                        label="Approved"
                    />
                </Tabs>
            </Box>

            <Stack spacing={2}>
                {filteredProjects().length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No projects yet</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => navigate('/my-projects/new')}
                            sx={{ mt: 2 }}
                        >
                            Create Your First Project
                        </Button>
                    </Box>
                ) : (
                    filteredProjects().map((project) => (
                        <ProjectApprovalCard
                            key={project.id}
                            project={project}
                            onApprove={async () => { }}
                            onReject={async () => { }}
                            onEdit={(id) => navigate(`/my-projects/${id}/edit`)}
                            onDelete={deleteProject}
                        />
                    ))
                )}
            </Stack>
        </Container>
    );
};

export default MyProjects;
