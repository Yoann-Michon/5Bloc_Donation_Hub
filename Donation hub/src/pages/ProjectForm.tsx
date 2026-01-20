import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Card,
    CardContent,
    Alert,
} from '@mui/material';
import { Save, Send } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';

const categories = ['Education', 'Environment', 'Health', 'DeFi', 'Technology', 'Social'];

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { getProjectById, createProject, updateProject, canEdit } = useProjects();
    const { isAdmin, requiresApproval } = useRole();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Education',
        author: '',
        image: '',
        goal: '',
        daysLeft: '',
        raised: '0',
        backers: '0',
    });

    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            const project = getProjectById(Number(id));
            if (project) {
                if (!canEdit(project)) {
                    showToast('You do not have permission to edit this project', 'error');
                    navigate('/my-projects');
                    return;
                }

                setFormData({
                    title: project.title,
                    description: project.description,
                    category: project.category,
                    author: project.author,
                    image: project.image,
                    goal: project.goal.toString(),
                    daysLeft: project.daysLeft.toString(),
                    raised: project.raised.toString(),
                    backers: project.backers.toString(),
                });
            }
        }
    }, [id, isEditMode, getProjectById, canEdit, showToast, navigate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const projectData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                author: formData.author,
                image: formData.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
                goal: parseFloat(formData.goal),
                daysLeft: parseInt(formData.daysLeft),
                raised: parseFloat(formData.raised),
                backers: parseInt(formData.backers),
            };

            if (isEditMode) {
                await updateProject(Number(id), projectData);
                showToast('Project updated successfully!', 'success');
                navigate('/my-projects');
            } else {
                await createProject(projectData);
                const message = isAdmin
                    ? 'Project created and approved!'
                    : 'Project submitted for review!';
                showToast(message, 'success');
                navigate(isAdmin ? '/admin' : '/my-projects');
            }
        } catch (error) {
            showToast('Failed to save project', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {isEditMode ? 'Edit Project' : 'Create New Project'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {isEditMode ? 'Update your project details' : 'Fill in the details for your new project'}
                </Typography>
            </Box>

            {!isAdmin && requiresApproval() && !isEditMode && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Your project will be submitted for admin approval before going live.
                </Alert>
            )}

            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <CardContent sx={{ p: 4 }}>
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Project Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Clean Water for Rural Schools"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Organization Name"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="Your Organization DAO"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    select
                                    label="Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your project goals, impact, and how funds will be used..."
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    type="number"
                                    label="Funding Goal (ETH)"
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleChange}
                                    inputProps={{ min: 0, step: 0.1 }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    type="number"
                                    label="Campaign Duration (days)"
                                    name="daysLeft"
                                    value={formData.daysLeft}
                                    onChange={handleChange}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Project Image URL (optional)"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </Grid>

                            {isEditMode && (
                                <>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Raised (ETH)"
                                            name="raised"
                                            value={formData.raised}
                                            onChange={handleChange}
                                            inputProps={{ min: 0, step: 0.01 }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Number of Backers"
                                            name="backers"
                                            value={formData.backers}
                                            onChange={handleChange}
                                            inputProps={{ min: 0 }}
                                        />
                                    </Grid>
                                </>
                            )}

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(isAdmin ? '/admin' : '/my-projects')}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={isAdmin ? <Save /> : <Send />}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : isAdmin ? 'Create & Approve' : 'Submit for Review'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ProjectForm;
