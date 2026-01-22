import { Box, Container, Typography, Button, TextField, Grid, Card, CardContent } from '@mui/material';
import { Send, Phone, HowToVote, CheckCircle, Description, Group } from '@mui/icons-material';
import { useState } from 'react';

const JoinUs = () => {

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Merci pour votre soumission ! Nous vous contacterons bientôt.');
    };

    const submissionSteps = [
        {
            number: '01',
            title: 'Soumettez votre projet',
            description: 'Remplissez le formulaire ci-dessous avec toutes les informations sur votre projet : nom, catégorie, objectif de financement, durée, et description détaillée.',
            icon: <Description sx={{ fontSize: 48 }} />,
        },
        {
            number: '02',
            title: 'Entretien téléphonique',
            description: 'Notre équipe vous contactera pour un appel téléphonique afin de mieux comprendre vos motivations, votre vision et les détails de votre projet.',
            icon: <Phone sx={{ fontSize: 48 }} />,
        },
        {
            number: '03',
            title: 'Vote communautaire',
            description: 'Chaque semaine, les détenteurs de tokens votent pour décider quels projets seront ajoutés à la plateforme. Les projets les plus votés sont acceptés.',
            icon: <HowToVote sx={{ fontSize: 48 }} />,
        },
    ];

    const requirements = [
        'Projet aligné avec nos valeurs (impact social, environnemental, ou technologique)',
        'Objectif de financement réaliste et bien défini',
        'Équipe identifiable avec expérience pertinente',
        'Plan de développement clair avec jalons mesurables',
        'Transparence totale sur l\'utilisation des fonds',
        'Engagement à fournir des mises à jour régulières',
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
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
                            Rejoignez-nous
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', mb: 4 }}>
                            Vous êtes un créateur de projet avec une vision innovante ? Soumettez votre projet et rejoignez notre communauté de créateurs engagés.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                            <Group sx={{ color: 'primary.main', fontSize: 32 }} />
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                Plus de <strong style={{ color: '#5227FF' }}>150+ projets</strong> déjà financés
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mb: 12 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 6, textAlign: 'center' }}>
                            Processus de Soumission
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 4 }}>
                            {submissionSteps.map((step, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        gap: 3,
                                        p: 4,
                                        borderRadius: 3,
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

                    <Box sx={{ mb: 8 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
                            Critères d'Éligibilité
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

                    <Box sx={{ mb: 8 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
                            Formulaire de Soumission
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
                                                label="Nom du Projet"
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
                                                label="Nom du Créateur"
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
                                                label="Téléphone"
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
                                                label="Catégorie"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                variant="outlined"
                                                placeholder="Ex: Education, Environment, Health..."
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="Objectif de Financement (ETH)"
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
                                                label="Durée du Projet (jours)"
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
                                                label="Site Web (optionnel)"
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
                                                label="Description du Projet"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                variant="outlined"
                                                placeholder="Décrivez votre projet en détail : objectifs, impact attendu, utilisation des fonds, jalons..."
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    startIcon={<Send />}
                                                    sx={{ px: 6, py: 1.5 }}
                                                >
                                                    Soumettre mon Projet
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
                            p: 6,
                            borderRadius: 3,
                            bgcolor: 'rgba(82, 39, 255, 0.1)',
                            border: '1px solid rgba(82, 39, 255, 0.3)',
                        }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                            Des Questions ?
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                            Notre équipe est là pour vous aider à préparer votre soumission
                        </Typography>
                        <Button
                            variant="outlined"
                            size="large"
                            href="mailto:support@donationhub.com"
                            sx={{ px: 4 }}
                        >
                            Contactez-nous
                        </Button>
                    </Box>
                </Container>
    );
};

export default JoinUs;
