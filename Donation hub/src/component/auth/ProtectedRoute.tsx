import { type ReactNode, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useWallet } from '../../hooks/useWallet';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * ProtectedRoute Component
 * Redirects to home if user is not connected
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isConnected, isInitialized } = useWallet();
    const navigate = useNavigate();

    useEffect(() => {
        if (isInitialized && !isConnected) {
            navigate('/', { replace: true });
        }
    }, [isConnected, isInitialized, navigate]);

    if (!isInitialized || !isConnected) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
