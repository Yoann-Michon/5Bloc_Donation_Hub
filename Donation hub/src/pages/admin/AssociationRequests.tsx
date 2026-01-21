import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tabs,
    Tab,
    Alert,
    Link,
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    OpenInNew,
    Email,
    Language,
    Description,
    Info,
} from '@mui/icons-material';
import { governanceService } from '../../services/governanceService';
import { useToast } from '../../context/ToastContext';
import type { AssociationRequest } from '../../types/governance';

const AssociationRequests = () => {
    const { showToast } = useToast();
    const [requests, setRequests] = useState<AssociationRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<AssociationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<AssociationRequest | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
    const [notes, setNotes] = useState('');
    const [currentTab, setCurrentTab] = useState(0);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await governanceService.getAssociationRequests();
            setRequests(data);
            filterRequests(data, currentTab);
        } catch {
            showToast('Failed to fetch requests', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filterRequests = (data: AssociationRequest[], tab: number) => {
        let filtered = data;
        switch (tab) {
            case 0:
                filtered = data.filter((r) => r.status === 'Pending' || r.status === 'NeedsInfo');
                break;
            case 1:
                filtered = data.filter((r) => r.status === 'Approved');
                break;
            case 2:
                filtered = data.filter((r) => r.status === 'Rejected');
                break;
            default:
                filtered = data;
        }
        setFilteredRequests(filtered);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        filterRequests(requests, newValue);
    };

    const handleOpenDialog = (request: AssociationRequest, type: 'approve' | 'reject') => {
        setSelectedRequest(request);
        setDialogType(type);
        setNotes('');
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedRequest(null);
        setNotes('');
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            await governanceService.approveAssociationRequest(selectedRequest.id, notes);
            showToast('Request approved successfully!', 'success');
            handleCloseDialog();
            fetchRequests();
        } catch {
            showToast('Failed to approve request', 'error');
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !notes.trim()) {
            showToast('Please provide a rejection reason', 'error');
            return;
        }

        try {
            await governanceService.rejectAssociationRequest(selectedRequest.id, notes);
            showToast('Request rejected', 'success');
            handleCloseDialog();
            fetchRequests();
        } catch {
            showToast('Failed to reject request', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'warning';
            case 'Approved':
                return 'success';
            case 'Rejected':
                return 'error';
            case 'NeedsInfo':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Association Requests
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Review and manage applications to become verified associations
                </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab
                        label={`Pending (${requests.filter((r) => r.status === 'Pending' || r.status === 'NeedsInfo').length})`}
                    />
                    <Tab label={`Approved (${requests.filter((r) => r.status === 'Approved').length})`} />
                    <Tab label={`Rejected (${requests.filter((r) => r.status === 'Rejected').length})`} />
                </Tabs>
            </Box>

            {filteredRequests.length === 0 ? (
                <Alert severity="info">No requests in this category</Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {filteredRequests.map((request) => (
                        <Card
                            key={request.id}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                {request.organizationName}
                                            </Typography>
                                            <Chip label={request.status} color={getStatusColor(request.status)} size="small" />
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                            Wallet: {request.walletAddress}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Submitted: {formatDate(request.submittedAt)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        <Typography variant="body2">{request.email}</Typography>
                                    </Box>
                                    {request.website && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Language sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Link href={request.website} target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                {request.website}
                                                <OpenInNew sx={{ fontSize: 14 }} />
                                            </Link>
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                        Description
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {request.description}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                        Reason for Application
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {request.reason}
                                    </Typography>
                                </Box>

                                {request.proofDocuments.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                            Proof Documents
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {request.proofDocuments.map((doc, index) => (
                                                <Link
                                                    key={index}
                                                    href={doc}
                                                    target="_blank"
                                                    rel="noopener"
                                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                >
                                                    <Description sx={{ fontSize: 16 }} />
                                                    {doc}
                                                    <OpenInNew sx={{ fontSize: 14 }} />
                                                </Link>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {request.reviewNotes && (
                                    <Box sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: 'rgba(82, 39, 255, 0.05)' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                            Review Notes
                                        </Typography>
                                        <Typography variant="body2">{request.reviewNotes}</Typography>
                                        {request.reviewedAt && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                                                Reviewed: {formatDate(request.reviewedAt)}
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {request.rejectionReason && (
                                    <Box sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: 'rgba(239, 68, 68, 0.05)' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#EF4444' }}>
                                            Rejection Reason
                                        </Typography>
                                        <Typography variant="body2">{request.rejectionReason}</Typography>
                                    </Box>
                                )}

                                {(request.status === 'Pending' || request.status === 'NeedsInfo') && (
                                    <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircle />}
                                            onClick={() => handleOpenDialog(request, 'approve')}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Cancel />}
                                            onClick={() => handleOpenDialog(request, 'reject')}
                                        >
                                            Reject
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {dialogType === 'approve' ? 'Approve Association Request' : 'Reject Association Request'}
                </DialogTitle>
                <DialogContent>
                    {selectedRequest && (
                        <Box sx={{ pt: 2 }}>
                            <Alert severity={dialogType === 'approve' ? 'success' : 'error'} icon={<Info />} sx={{ mb: 3 }}>
                                {dialogType === 'approve'
                                    ? `This will grant association privileges to ${selectedRequest.organizationName}. They will be able to create and manage fundraising projects.`
                                    : `This will reject the application from ${selectedRequest.organizationName}. They will receive an email notification with your rejection reason.`}
                            </Alert>

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label={dialogType === 'approve' ? 'Notes (Optional)' : 'Rejection Reason (Required)'}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={
                                    dialogType === 'approve'
                                        ? 'Add any notes about this approval...'
                                        : 'Explain why this request is being rejected...'
                                }
                                required={dialogType === 'reject'}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={handleCloseDialog} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={dialogType === 'approve' ? handleApprove : handleReject}
                        variant="contained"
                        color={dialogType === 'approve' ? 'success' : 'error'}
                        disabled={dialogType === 'reject' && !notes.trim()}
                    >
                        {dialogType === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AssociationRequests;
