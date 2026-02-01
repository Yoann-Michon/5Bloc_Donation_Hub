import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useToast } from '../../context/ToastContext';
import type { Badge } from '../../types/badge';

interface ListBadgeModalProps {
    open: boolean;
    onClose: () => void;
    badge: Badge | null;
}

const ListBadgeModal = ({ open, onClose, badge }: ListBadgeModalProps) => {
    const [price, setPrice] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { listBadge } = useMarketplace();
    const { showToast } = useToast();

    const handleList = async () => {
        if (!badge || !price) return;

        setIsProcessing(true);
        try {
            await listBadge(Number(badge.id), price);
            showToast('Badge listed successfully!', 'success');
            onClose();
        } catch (error: any) {
            showToast(error.message || 'Listing failed', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: 'rgba(25, 24, 45, 0.95)', backdropFilter: 'blur(20px)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' } }}>
            <DialogTitle sx={{ fontWeight: 800 }}>List Badge for Sale</DialogTitle>
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        You are listing <strong>{badge?.name}</strong> (#{badge?.id}).
                        You will need to approve the marketplace contract if you haven't done so already.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Price in ETH"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.1"
                        autoFocus
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} disabled={isProcessing}>Cancel</Button>
                <Button
                    onClick={handleList}
                    variant="contained"
                    disabled={!price || isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                    {isProcessing ? 'Processing...' : 'Approve & List'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ListBadgeModal;
