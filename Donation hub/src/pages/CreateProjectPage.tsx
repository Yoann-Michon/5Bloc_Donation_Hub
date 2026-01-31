import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

interface Category {
    id: string;
    name: string;
    slug: string;
}

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal: '',
        category: '',
        image: '',
    });

    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/projects', {
                title: formData.title,
                description: formData.description,
                goal: parseFloat(formData.goal),
                category: formData.category,
                image: formData.image || undefined,
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard/my-projects'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                ➕ Créer un Nouveau Projet
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Projet créé avec succès ! Il est en attente d'approbation. Redirection...
                </Alert>
            )}

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Card>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            required
                            fullWidth
                            label="Titre du projet"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            required
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            sx={{ mb: 3 }}
                            helperText="Décrivez votre projet en détail"
                        />

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Catégorie</InputLabel>
                            <Select
                                required
                                value={formData.category}
                                label="Catégorie"
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            required
                            fullWidth
                            type="number"
                            label="Objectif (ETH)"
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            sx={{ mb: 3 }}
                            inputProps={{ step: '0.01', min: '0.01' }}
                            helperText="Montant que vous souhaitez collecter"
                        />

                        <TextField
                            fullWidth
                            label="URL de l'image (optionnel)"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            sx={{ mb: 3 }}
                            helperText="Lien vers une image représentant votre projet"
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ minWidth: 200 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Créer le Projet'}
                            </Button>
                            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                                Annuler
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateProjectPage;
