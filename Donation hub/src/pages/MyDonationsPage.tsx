import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import api from '../utils/api';

interface Donation {
    id: string;
    amount: number;
    txHash: string;
    createdAt: string;
    project: {
        id: number;
        title: string;
    };
}

const MyDonationsPage = () => {
    const { account } = useWallet();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!account) return;

        const fetchDonations = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/donations/by-wallet/${account}`);
                setDonations(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load donations');
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();
    }, [account]);

    const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const uniqueProjects = new Set(donations.map(d => d.project?.id)).size;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                💝 Mes Donations
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">{totalDonated.toFixed(4)} ETH</Typography>
                            <Typography color="text.secondary">Total donné</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">{donations.length}</Typography>
                            <Typography color="text.secondary">Donations</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">{uniqueProjects}</Typography>
                            <Typography color="text.secondary">Projets soutenus</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : donations.length === 0 ? (
                <Alert severity="info">
                    Vous n'avez pas encore fait de donation. Découvrez nos projets !
                </Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Projet</TableCell>
                                <TableCell align="right">Montant</TableCell>
                                <TableCell>Transaction</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {donations.map((donation) => (
                                <TableRow key={donation.id}>
                                    <TableCell>
                                        {new Date(donation.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Link component={RouterLink} to={`/projects/${donation.project?.id}`}>
                                            {donation.project?.title || 'Projet inconnu'}
                                        </Link>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip label={`${Number(donation.amount).toFixed(4)} ETH`} color="primary" size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                            {donation.txHash.slice(0, 10)}...{donation.txHash.slice(-8)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default MyDonationsPage;
