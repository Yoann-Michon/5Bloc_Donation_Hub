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
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    IconButton,
    Tooltip,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import api from '../utils/api';

interface User {
    id: string;
    walletAddress: string;
    role: string;
    organizationName?: string;
    email?: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
}

const AdminUsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [roleDialog, setRoleDialog] = useState<{ open: boolean; user: User | null }>({
        open: false,
        user: null,
    });
    const [newRole, setNewRole] = useState('');
    const [roleReason, setRoleReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = tabValue === 0
        ? users
        : users.filter(u => u.role === ['USER', 'ADMIN', 'ASSOCIATION', 'USER'][tabValue]);

    const handleChangeRole = async () => {
        if (!roleDialog.user) return;
        setActionLoading(true);
        try {
            await api.patch(`/users/${roleDialog.user.walletAddress}/role`, {
                newRole,
                reason: roleReason,
            });
            setRoleDialog({ open: false, user: null });
            setNewRole('');
            setRoleReason('');
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change role');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async (user: User) => {
        setActionLoading(true);
        try {
            const endpoint = user.isActive ? 'deactivate' : 'activate';
            await api.patch(`/users/${user.walletAddress}/${endpoint}`);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to toggle user status');
        } finally {
            setActionLoading(false);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'ASSOCIATION': return 'primary';
            case 'USER': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                👥 Gestion des Utilisateurs
            </Typography>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label={`Tous (${users.length})`} />
                <Tab label={`Admins (${users.filter(u => u.role === 'ADMIN').length})`} />
                <Tab label={`Associations (${users.filter(u => u.role === 'ASSOCIATION').length})`} />
                <Tab label={`Users (${users.filter(u => u.role === 'USER').length})`} />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Wallet</TableCell>
                                <TableCell>Rôle</TableCell>
                                <TableCell>Organisation</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={user.role} color={getRoleColor(user.role) as any} size="small" />
                                    </TableCell>
                                    <TableCell>{user.organizationName || '-'}</TableCell>
                                    <TableCell>{user.email || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.isActive ? 'Actif' : 'Inactif'}
                                            color={user.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Changer le rôle">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setRoleDialog({ open: true, user });
                                                    setNewRole(user.role);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={user.isActive ? 'Désactiver' : 'Activer'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleActive(user)}
                                                disabled={actionLoading}
                                            >
                                                {user.isActive ? <BlockIcon color="error" /> : <CheckCircleIcon color="success" />}
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={roleDialog.open} onClose={() => setRoleDialog({ open: false, user: null })}>
                <DialogTitle>Changer le rôle</DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Utilisateur: {roleDialog.user?.walletAddress.slice(0, 12)}...
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Nouveau rôle</InputLabel>
                        <Select
                            value={newRole}
                            label="Nouveau rôle"
                            onChange={(e) => setNewRole(e.target.value)}
                        >
                            <MenuItem value="USER">USER</MenuItem>
                            <MenuItem value="ASSOCIATION">ASSOCIATION</MenuItem>
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Raison du changement"
                        fullWidth
                        multiline
                        rows={2}
                        value={roleReason}
                        onChange={(e) => setRoleReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoleDialog({ open: false, user: null })}>
                        Annuler
                    </Button>
                    <Button onClick={handleChangeRole} variant="contained" disabled={actionLoading}>
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminUsersPage;
