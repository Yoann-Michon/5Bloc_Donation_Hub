import { Box, Typography, Card, CardContent, Chip, Button, Grid } from '@mui/material';
import { CheckCircle, Cancel, Edit, Delete } from '@mui/icons-material';
import type { Project } from '../../types/project';
import { useToast } from '../../context/ToastContext';

interface ProjectApprovalCardProps {
    project: Project;
    onApprove: (id: number) => Promise<void>;
    onReject: (id: number) => Promise<void>;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => Promise<void>;
}

export const ProjectApprovalCard = ({ project, onApprove, onReject, onEdit, onDelete }: ProjectApprovalCardProps) => {
    const { showToast } = useToast();

    const handleApprove = async () => {
        try {
            await onApprove(project.id);
            showToast(`Project "${project.title}" approved!`, 'success');
        } catch (error) {
            showToast('Failed to approve project', 'error');
        }
    };

    const handleReject = async () => {
        try {
            await onReject(project.id);
            showToast(`Project "${project.title}" rejected`, 'info');
        } catch (error) {
            showToast('Failed to reject project', 'error');
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        if (!confirm(`Are you sure you want to delete "${project.title}"?`)) return;

        try {
            await onDelete(project.id);
            showToast(`Project "${project.title}" deleted`, 'success');
        } catch (error) {
            showToast('Failed to delete project', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'error';
            case 'Draft': return 'default';
            default: return 'info';
        }
    };

    return (
        <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>{project.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {project.description.substring(0, 150)}...
                        </Typography>
                    </Box>
                    <Chip label={project.status} color={getStatusColor(project.status)} size="small" />
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Category</Typography>
                        <Typography variant="body2">{project.category}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Goal</Typography>
                        <Typography variant="body2">{project.goal} ETH</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Author</Typography>
                        <Typography variant="body2">{project.author}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Owner</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {project.ownerWallet.substring(0, 6)}...{project.ownerWallet.substring(38)}
                        </Typography>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {project.status === 'Pending' && (
                        <>
                            <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={handleApprove}
                            >
                                Approve
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={handleReject}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    {onEdit && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => onEdit(project.id)}
                        >
                            Edit
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
