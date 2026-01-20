import { Box, Container, Typography, Button, TextField, Grid, Card, CardContent } from '@mui/material';
import { Send, Phone, HowToVote, CheckCircle, Description, Group } from '@mui/icons-material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useToast } from '../context/ToastContext';

const JoinUs = () => {
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        projectName: '',
        creatorName: '',
        email: '',
        phone: '',
        category: '',
        description: '',
        goal: '',
        duration: '',
        website: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        showToast('Thank you for your submission! We will contact you soon.', 'success');
    };

    const submissionSteps = [
        {
            number: '01',
            title: 'Submit Your Project',
            description: 'Fill out the form below with all information about your project: name, category, funding goal, duration, and detailed description.',
            icon: <Description sx={{ fontSize: 48 }} />,
        },
        {
            number: '02',
            title: 'Phone Interview',
            description: 'Our team will contact you for a phone call to better understand your motivations, vision, and project details.',
            icon: <Phone sx={{ fontSize: 48 }} />,
        },
        {
            number: '03',
            title: 'Community Vote',
            description: 'Every week, token holders vote to decide which projects will be added to the platform. The most voted projects are accepted.',
            icon: <HowToVote sx={{ fontSize: 48 }} />,
        },
    ];

    const requirements = [
        'Project aligned with our values (social, environmental, or technological impact)',
        'Realistic and well-defined funding goal',
        'Identifiable team with relevant experience',
        'Clear development plan with measurable milestones',
        'Full transparency on fund usage',
        'Commitment to provide regular updates',
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 800,
                        mb: 2,
                        background: 'linear-gradient(135deg, #5227FF 0%, #00E5FF 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Join Us
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', mb: 4 }}>
                    Are you a project creator with an innovative vision? Submit your project and join our community of committed creators.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Group sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Over <strong style={{ color: '#5227FF' }}>150+ projects</strong> already funded
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                    Submission Process
                </Typography>
                <Box sx={{ display: 'grid', gap: 4 }}>
                    {submissionSteps.map((step, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                gap: 3,
                                p: 4,
                                borderRadius: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'primary.main',
                                    transform: 'translateX(8px)',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 2,
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 20px rgba(82, 39, 255, 0.3)',
                                }}
                            >
                                {step.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        color: 'primary.main',
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.1em',
                                    }}
                                >
                                    ÉTAPE {step.number}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                    {step.title}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                    {step.description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
                    Eligibility Criteria
                </Typography>
                <Card
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Grid container spacing={2}>
                            {requirements.map((req, index) => (
                                <Grid size={{ xs: 12, md: 6 }} key={index}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <CheckCircle sx={{ color: 'primary.main', fontSize: 24, mt: 0.5 }} />
                                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                            {req}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
                    Submission Form
                </Typography>
                <Card
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Project Name"
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Creator Name"
                                        name="creatorName"
                                        value={formData.creatorName}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        type="email"
                                        label="Email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        variant="outlined"
                                        placeholder="e.g., Education, Environment, Health..."
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Funding Goal (ETH)"
                                        name="goal"
                                        value={formData.goal}
                                        onChange={handleChange}
                                        variant="outlined"
                                        type="number"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Project Duration (days)"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        variant="outlined"
                                        type="number"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Website (optional)"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        multiline
                                        rows={6}
                                        label="Project Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        variant="outlined"
                                        placeholder="Describe your project in detail: objectives, expected impact, fund usage, milestones..."
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            startIcon={<Send />}
                                            sx={{ px: 4, py: 1.5 }}
                                        >
                                            Submit My Project
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            </Box>

            <Box
                sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'rgba(82, 39, 255, 0.1)',
                    border: '1px solid rgba(82, 39, 255, 0.3)',
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Questions?
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                    Our team is here to help you prepare your submission
                </Typography>
                <Button
                    variant="outlined"
                    size="large"
                    href="mailto:support@donationhub.com"
                    sx={{ px: 4 }}
                >
                    Contact Us
                </Button>
            </Box>
        </Container>
    );
};

export default JoinUs;
