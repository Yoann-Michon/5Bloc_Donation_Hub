import { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { AccountBalance, CheckCircle, Cancel, Info } from '@mui/icons-material';
import { useWallet } from '../hooks/useWallet';
import api from '../utils/api';

interface Project {
    id: number;
    title: string;
    description: string;
    goal: string;
    raised: string;
    ownerWallet: string;
    status: string;
    createdAt: string;
}

const AdminWithdrawals = () => {
    const { account, user } = useWallet();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        if (isAdmin) {
            fetchPendingProjects();
        }
    }, [isAdmin]);

    const fetchPendingProjects = async () => {
        try {
            setLoading(true);
            const response = await api.get('/projects/admin/pending-withdrawal');
            setProjects(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (project: Project) => {
        setSelectedProject(project);
        setDialogOpen(true);
    };

    const confirmWithdrawal = async () => {
        if (!selectedProject) return;

        try {
            setProcessing(true);
            await api.post(`/projects/${selectedProject.id}/withdraw`, {
                recipientAddress: selectedProject.ownerWallet,
            });

            alert('Funds successfully transferred!');
            setDialogOpen(false);
            setSelectedProject(null);
            fetchPendingProjects();
        } catch (err: any) {
            alert(`Failed to transfer funds: ${err.response?.data?.message || 'Unknown error'}`);
        } finally {
            setProcessing(false);
        }
    };

    if (!account) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">Please connect your wallet to access admin panel.</Alert>
            </Container>
        );
    }

    if (!isAdmin) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Access denied. Admin privileges required.</Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(82, 39, 255, 0.4)',
                    }}
                >
                    <AccountBalance sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <div>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Withdrawal Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Approve fund transfers to project owners
                    </Typography>
                </div>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {projects.length === 0 ? (
                <Alert severity="info" icon={<Info />}>
                    No projects pending withdrawal.
                </Alert>
            ) : (
                <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Project</TableCell>
                                <TableCell align="right">Goal</TableCell>
                                <TableCell align="right">Raised</TableCell>
                                <TableCell>Owner Address</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {project.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            ID: {project.id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">{project.goal} ETH</TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={`${project.raised} ETH`}
                                            color="primary"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                        >
                                            {project.ownerWallet.slice(0, 6)}...
                                            {project.ownerWallet.slice(-4)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            startIcon={<CheckCircle />}
                                            onClick={() => handleApprove(project)}
                                        >
                                            Approve Transfer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onClose={() => !processing && setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Fund Transfer</DialogTitle>
                <DialogContent>
                    {selectedProject && (
                        <Box sx={{ py: 2 }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                This action cannot be undone. Please verify all information before proceeding.
                            </Alert>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Project
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {selectedProject.title}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Amount to Transfer
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {selectedProject.raised} ETH
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Recipient Address
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {selectedProject.ownerWallet}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmWithdrawal}
                        variant="contained"
                        color="success"
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
                    >
                        {processing ? 'Processing...' : 'Confirm Transfer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminWithdrawals;
