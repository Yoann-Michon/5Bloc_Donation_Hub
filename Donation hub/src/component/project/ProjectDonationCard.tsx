import { Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import { motion } from 'motion/react';
import type { Project } from '../../types/project';

interface ProjectDonationCardProps {
    project: Project;
    percentage: number;
    onDonate: () => void;
}

const ProjectDonationCard = ({ project, percentage, onDonate }: ProjectDonationCardProps) => {
    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            sx={{
                position: 'sticky',
                top: 100,
                p: 3,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(82, 39, 255, 0.2)',
                borderRadius: 2,
                boxShadow: '0 25px 50px -12px rgba(82, 39, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    Contribute
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#00f2ff',
                            boxShadow: '0 0 10px #00f2ff',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': { boxShadow: '0 0 0 0 rgba(0, 242, 255, 0.7)' },
                                '70%': { boxShadow: '0 0 0 6px rgba(0, 242, 255, 0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(0, 242, 255, 0)' },
                            }
                        }}
                    />
                    <Typography variant="caption" sx={{ color: '#00f2ff', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.625rem' }}>
                        Network Live
                    </Typography>
                </Box>
            </Box>

            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <Typography component="span" sx={{ color: 'text.secondary', fontSize: 'inherit' }}>Raised</Typography>
                    <Typography component="span" sx={{ color: 'white', fontSize: 'inherit' }}>{project.raised} ETH / {project.goal} ETH</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            width: `${Math.min(percentage, 100)}%`,
                            height: '100%',
                            bgcolor: 'primary.main',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={onDonate}
                sx={{
                    py: 2,
                    fontSize: '0.875rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    borderRadius: 1.5,
                    boxShadow: '0 0 20px rgba(82, 39, 255, 0.4)',
                    animation: 'pulse-glow 2s infinite',
                    '@keyframes pulse-glow': {
                        '0%': { boxShadow: '0 0 0 0 rgba(82, 39, 255, 0.7)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(82, 39, 255, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(82, 39, 255, 0)' },
                    }
                }}
            >
                Donate Now
            </Button>

            <Typography variant="caption" align="center" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.625rem' }}>
                Connected via MetaMask: 0x4f1...9a21
            </Typography>
        </Box>
    );
};

export default ProjectDonationCard;
