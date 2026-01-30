import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../utils/api';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
}

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialog, setDialog] = useState<{ open: boolean; category: Category | null; mode: 'create' | 'edit' }>({
        open: false,
        category: null,
        mode: 'create',
    });
    const [formData, setFormData] = useState({ name: '', slug: '', description: '', icon: '', color: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenDialog = (mode: 'create' | 'edit', category?: Category) => {
        if (mode === 'edit' && category) {
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                icon: category.icon || '',
                color: category.color || '',
            });
            setDialog({ open: true, category, mode });
        } else {
            setFormData({ name: '', slug: '', description: '', icon: '', color: '' });
            setDialog({ open: true, category: null, mode: 'create' });
        }
    };

    const handleSubmit = async () => {
        setActionLoading(true);
        try {
            if (dialog.mode === 'create') {
                await api.post('/categories', formData);
            } else if (dialog.category) {
                await api.patch(`/categories/${dialog.category.id}`, formData);
            }
            setDialog({ open: false, category: null, mode: 'create' });
            fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
        setActionLoading(true);
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete category');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    📂 Gestion des Catégories
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('create')}>
                    Nouvelle Catégorie
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {categories.map((category) => (
                        <Grid item xs={12} sm={6} md={4} key={category.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="h6">
                                                {category.icon} {category.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Slug: {category.slug}
                                            </Typography>
                                            {category.description && (
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    {category.description}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box>
                                            <IconButton size="small" onClick={() => handleOpenDialog('edit', category)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(category.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={dialog.open} onClose={() => setDialog({ open: false, category: null, mode: 'create' })} maxWidth="sm" fullWidth>
                <DialogTitle>{dialog.mode === 'create' ? 'Créer une catégorie' : 'Modifier la catégorie'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nom"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Slug"
                        fullWidth
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Icône (emoji)"
                        fullWidth
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Couleur"
                        fullWidth
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog({ open: false, category: null, mode: 'create' })}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={actionLoading}>
                        {dialog.mode === 'create' ? 'Créer' : 'Modifier'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminCategoriesPage;
