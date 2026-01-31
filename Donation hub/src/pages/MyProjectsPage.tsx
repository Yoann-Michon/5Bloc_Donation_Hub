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
    LinearProgress,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

interface Project {
    id: number;
    title: string;
    description: string;
    goal: number;
    raised: number;
    image: string;
    status: string;
    category?: { name: string };
    donations?: any[];
    createdAt: string;
}

const MyProjectsPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; projectId: number | null }>({
        open: false,
        projectId: null,
    });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await api.get('/projects/my-projects');
            setProjects(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async () => {
        if (!deleteDialog.projectId) return;
        setActionLoading(true);
        try {
            await api.delete(`/projects/${deleteDialog.projectId}`);
            setDeleteDialog({ open: false, projectId: null });
            fetchProjects();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete project');
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'APPROVED': return 'Approuvé';
            case 'REJECTED': return 'Rejeté';
            case 'FUNDRAISING': return 'Collecte en cours';
            case 'COMPLETED': return 'Terminé';
            default: return status;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    📁 Mes Projets
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/dashboard/create-project')}
                >
                    Nouveau Projet
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : projects.length === 0 ? (
                <Alert severity="info">
                    Vous n'avez pas encore de projets. Créez votre premier projet dès maintenant !
                </Alert>
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
                                            label={getStatusLabel(project.status)}
                                            color={getStatusColor(project.status) as any}
                                            size="small"
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                                        {project.description}
                                    </Typography>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2">{project.raised} / {project.goal} ETH</Typography>
                                            <Typography variant="body2">
                                                {Math.min(100, Math.round((project.raised / project.goal) * 100))}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min(100, (project.raised / project.goal) * 100)}
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary">
                                        {project.donations?.length || 0} donateur(s)
                                    </Typography>
                                </CardContent>

                                <Box sx={{ p: 2, display: 'flex', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Button
                                        size="small"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                        fullWidth
                                    >
                                        Voir
                                    </Button>
                                    {['PENDING', 'APPROVED'].includes(project.status) && (
                                        <IconButton size="small">
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                    {project.status === 'PENDING' && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => setDeleteDialog({ open: true, projectId: project.id })}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, projectId: null })}>
                <DialogTitle>Supprimer le projet</DialogTitle>
                <DialogContent>
                    <Typography>Êtes-vous sûr de vouloir supprimer ce projet ?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, projectId: null })}>
                        Annuler
                    </Button>
                    <Button onClick={handleDelete} color="error" disabled={actionLoading}>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyProjectsPage;
