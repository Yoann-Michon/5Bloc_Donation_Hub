import { Box, Container, Typography, Button } from '@mui/material';
import { CheckCircle, Security, Speed, TrendingUp } from '@mui/icons-material';

const HowItWorks = () => {

    const steps = [
        {
            number: '01',
            title: 'Connect Your Wallet',
            description: 'Link your Web3 wallet (MetaMask, WalletConnect, etc.) to get started. Your wallet is your identity on the blockchain.',
            icon: <Security sx={{ fontSize: 48 }} />,
        },
        {
            number: '02',
            title: 'Explore Projects',
            description: 'Browse through verified projects across various categories. Each project has transparent goals, timelines, and smart contract details.',
            icon: <TrendingUp sx={{ fontSize: 48 }} />,
        },
        {
            number: '03',
            title: 'Make a Contribution',
            description: 'Choose your contribution amount and send funds directly through the blockchain. All transactions are transparent and traceable.',
            icon: <CheckCircle sx={{ fontSize: 48 }} />,
        },
        {
            number: '04',
            title: 'Track Progress',
            description: 'Monitor your contributions and project milestones in real-time. Receive NFT badges as proof of your support.',
            icon: <Speed sx={{ fontSize: 48 }} />,
        },
    ];

    const features = [
        {
            title: 'Blockchain Transparency',
            description: 'Every transaction is recorded on the blockchain, ensuring complete transparency and accountability.',
        },
        {
            title: 'Smart Contract Security',
            description: 'Funds are held in audited smart contracts and released only when milestones are achieved.',
        },
        {
            title: 'NFT Rewards',
            description: 'Earn unique NFT badges based on your contribution level and support history.',
        },
        {
            title: 'Community Governance',
            description: 'Token holders can participate in platform decisions and project approvals.',
        },
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
                            How It Works
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
                            Transparent, secure, and decentralized crowdfunding powered by blockchain technology
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                            Getting Started in 4 Simple Steps
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 4 }}>
                            {steps.map((step, index) => (
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
                                            STEP {step.number}
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
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                            Platform Features
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                                gap: 3,
                            }}
                        >
                            {features.map((feature, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 4,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {feature.description}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
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
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                            Ready to Make a Difference?
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 600, mx: 'auto' }}>
                            Join thousands of contributors supporting innovative projects on the blockchain
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                href="/projects"
                                sx={{ px: 4, py: 1.5 }}
                            >
                                Explore Projects
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                href="/"
                                sx={{ px: 4, py: 1.5 }}
                            >
                                Learn More
                            </Button>
                        </Box>
                    </Box>
                </Container>
    );
};

export default HowItWorks;
