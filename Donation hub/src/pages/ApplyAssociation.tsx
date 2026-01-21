import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Alert,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Send,
    CheckCircle,
    AccountBalance,
    TrendingUp,
    MonetizationOn,
    Info,
    Upload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGovernance } from '../hooks/useGovernance';
import { useToast } from '../context/ToastContext';
import { useRole } from '../context/RoleContext';

const ApplyAssociation = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { submitAssociationRequest, isLoading } = useGovernance();
    const { currentRole } = useRole();

    const [formData, setFormData] = useState({
        organizationName: '',
        email: '',
        description: '',
        website: '',
        reason: '',
    });

    const [proofDocuments, setProofDocuments] = useState<string[]>([]);
    const [documentInput, setDocumentInput] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddDocument = () => {
        if (documentInput.trim()) {
            setProofDocuments([...proofDocuments, documentInput.trim()]);
            setDocumentInput('');
        }
    };

    const handleRemoveDocument = (index: number) => {
        setProofDocuments(proofDocuments.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (proofDocuments.length === 0) {
            showToast('Please add at least one proof document', 'error');
            return;
        }

        try {
            await submitAssociationRequest({
                ...formData,
                proofDocuments,
            });

            showToast('Application submitted successfully! You will be notified once reviewed.', 'success');
            navigate('/dashboard');
        } catch (error) {
            const err = error as Error;
            showToast(err.message || 'Failed to submit application', 'error');
        }
    };

    if (currentRole === 'ASSOCIATION' || currentRole === 'ADMIN') {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="info">
                    You already have {currentRole === 'ADMIN' ? 'administrator' : 'association'} privileges.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalance sx={{ color: 'primary.main' }} />
                    Become an Association
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Apply to become a verified association and unlock the ability to create fundraising projects
                </Typography>
            </Box>

            <Card sx={{ mb: 4, bgcolor: 'rgba(82, 39, 255, 0.05)', border: '1px solid rgba(82, 39, 255, 0.2)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: 'primary.main' }} />
                        Benefits as an Association
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon>
                                <TrendingUp sx={{ color: '#10B981' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Create fundraising projects"
                                secondary="Launch campaigns to raise funds for your initiatives"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <AccountBalance sx={{ color: '#10B981' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Manage your campaigns"
                                secondary="Edit and track your projects with full transparency"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <MonetizationOn sx={{ color: '#10B981' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Withdraw funds directly"
                                secondary="Access collected funds for your verified projects"
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            <Alert severity="warning" icon={<Info />} sx={{ mb: 3 }}>
                Your application will be reviewed by an administrator. This process typically takes 2-5 business days.
                You'll be notified via email once your application is reviewed.
            </Alert>

            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <CardContent sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Organization Name"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    placeholder="Green Future Foundation"
                                    helperText="Official name of your organization"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    type="email"
                                    label="Contact Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="contact@greenfuture.org"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Website (Optional)"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://greenfuture.org"
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                    label="Organization Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your organization's mission, activities, and impact..."
                                    helperText="Provide a detailed description of your organization"
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    required
                                    multiline
                                    rows={3}
                                    label="Reason for Application"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    placeholder="We want to launch fundraising campaigns for solar panel installations in developing countries..."
                                    helperText="Explain why you want to become an association on our platform"
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                                    Proof Documents *
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                                    Provide URLs to documents proving your organization's legitimacy (registration
                                    certificates, official website, social media, etc.)
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Document URL"
                                        value={documentInput}
                                        onChange={(e) => setDocumentInput(e.target.value)}
                                        placeholder="https://example.com/certificate.pdf or ipfs://..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddDocument();
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={handleAddDocument}
                                        disabled={!documentInput.trim()}
                                        startIcon={<Upload />}
                                    >
                                        Add
                                    </Button>
                                </Box>

                                {proofDocuments.length > 0 && (
                                    <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                                        {proofDocuments.map((doc, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 1,
                                                    '&:last-child': { mb: 0 },
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ wordBreak: 'break-all', flex: 1 }}>
                                                    {doc}
                                                </Typography>
                                                <Button size="small" color="error" onClick={() => handleRemoveDocument(index)}>
                                                    Remove
                                                </Button>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button variant="outlined" onClick={() => navigate('/dashboard')} disabled={isLoading}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<Send />}
                                        disabled={isLoading}
                                        sx={{ minWidth: 200 }}
                                    >
                                        {isLoading ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ApplyAssociation;
