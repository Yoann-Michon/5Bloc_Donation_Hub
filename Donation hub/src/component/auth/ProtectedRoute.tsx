import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useState, useEffect } from 'react';
import WalletConnectionModal from '../web3/WalletConnectionModal';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * ProtectedRoute Component
 * Redirects to home if user is not connected
 * Opens WalletConnectionModal automatically
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isConnected, isInitialized } = useWallet();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isInitialized && !isConnected) {
            setShowModal(true);
        }
    }, [isConnected, isInitialized]);

    if (!isInitialized) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isConnected) {
        return (
            <>
                <Navigate to="/" replace />
                <WalletConnectionModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                />
            </>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
