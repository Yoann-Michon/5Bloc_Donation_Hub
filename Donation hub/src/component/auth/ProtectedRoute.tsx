import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useState, useEffect } from 'react';
import WalletConnectionModal from '../web3/WalletConnectionModal';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isConnected } = useWallet();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!isConnected) {
            setShowModal(true);
        }
    }, [isConnected]);

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
