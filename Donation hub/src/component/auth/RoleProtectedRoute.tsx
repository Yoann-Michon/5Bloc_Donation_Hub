import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface RoleProtectedRouteProps {
    children: ReactNode;
    allowedRoles: string[];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
    const { isConnected, user, isInitialized } = useWallet();

    if (!isInitialized) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isConnected) {
        return <Navigate to="/dashboard" replace />;
    }


    if (!user || !allowedRoles.includes(user.role)) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    textAlign: 'center',
                    p: 4,
                }}
            >
                <LockOutlinedIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                    🚫 Accès Refusé
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 400 }}>
                    Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    {allowedRoles.length > 0 && (
                        <Box component="span" sx={{ display: 'block', mt: 1 }}>
                            Rôle(s) requis : {allowedRoles.join(', ')}
                        </Box>
                    )}
                </Typography>
                <Button variant="contained" href="/dashboard" color="primary">
                    Retour au Dashboard
                </Button>
            </Box>
        );
    }

    return <>{children}</>;
};

export default RoleProtectedRoute;
