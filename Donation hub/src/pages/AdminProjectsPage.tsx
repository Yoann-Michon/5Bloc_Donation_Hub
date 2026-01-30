import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    Chip,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../utils/api';

interface Project {
    id: number;
    title: string;
    description: string;
    goal: number;
    raised: number;
    image: string;
    status: string;
    ownerWallet: string;
    category?: { name: string };
    createdAt: string;
}

const AdminProjectsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; projectId: number | null }>({
        open: false,
        projectId: null,
    });
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchProjects = async (status?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = status === 'PENDING'
                ? await api.get('/projects/admin/pending')
                : await api.get('/projects');
            setProjects(status ? response.data.filter((p: Project) => p.status === status) : response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const statusMap = ['PENDING', 'APPROVED', 'REJECTED', undefined];
        fetchProjects(statusMap[tabValue]);
    }, [tabValue]);

    const handleApprove = async (projectId: number) => {
        setActionLoading(true);
        try {
            await api.patch(`/projects/${projectId}/approve`);
            fetchProjects(tabValue === 0 ? 'PENDING' : undefined);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to approve project');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectDialog.projectId) return;
        setActionLoading(true);
        try {
            await api.patch(`/projects/${rejectDialog.projectId}/reject`, { reason: rejectReason });
            setRejectDialog({ open: false, projectId: null });
            setRejectReason('');
            fetchProjects(tabValue === 0 ? 'PENDING' : undefined);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reject project');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            case 'FUNDRAISING': return 'info';
            case 'COMPLETED': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                🛡️ Gestion des Projets
            </Typography>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="En attente" />
                <Tab label="Approuvés" />
                <Tab label="Rejetés" />
                <Tab label="Tous" />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : projects.length === 0 ? (
                <Alert severity="info">Aucun projet trouvé</Alert>
            ) : (
                <Grid container spacing={3}>
                    {projects.map((project) => (
                        <Grid item xs={12} md={6} lg={4} key={project.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={project.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                                    alt={project.title}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="h6" noWrap>{project.title}</Typography>
                                        <Chip
                                            label={project.status}
                                            color={getStatusColor(project.status) as any}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                                        {project.description}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Catégorie:</strong> {project.category?.name || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Objectif:</strong> {project.goal} ETH
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                        {project.ownerWallet.slice(0, 10)}...{project.ownerWallet.slice(-8)}
                                    </Typography>
                                </CardContent>
                                {project.status === 'PENDING' && (
                                    <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleApprove(project.id)}
                                            disabled={actionLoading}
                                            fullWidth
                                        >
                                            Approuver
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<CancelIcon />}
                                            onClick={() => setRejectDialog({ open: true, projectId: project.id })}
                                            disabled={actionLoading}
                                            fullWidth
                                        >
                                            Rejeter
                                        </Button>
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, projectId: null })}>
                <DialogTitle>Rejeter le projet</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Raison du rejet (optionnel)"
                        fullWidth
                        multiline
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialog({ open: false, projectId: null })}>
                        Annuler
                    </Button>
                    <Button onClick={handleReject} color="error" disabled={actionLoading}>
                        Rejeter
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminProjectsPage;
