import { Box, Typography, Tooltip } from '@mui/material';
import { RocketLaunch, Park, EmojiEvents, Lock } from '@mui/icons-material';

const ProjectBadges = () => {
    return (
        <Box
            sx={{
                p: 3,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                mb: 3,
            }}
        >
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 2, letterSpacing: '0.1em' }}>
                Top Donor Badges
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
                <Tooltip title="Early Adopter NFT">
                    <Box sx={{
                        aspectRatio: '1',
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'help',
                        transition: 'all 0.3s',
                        '&:hover': {
                            borderColor: '#00f2ff',
                            '& svg': { transform: 'scale(1.1)' }
                        }
                    }}>
                        <RocketLaunch sx={{ color: '#00f2ff', transition: 'transform 0.3s' }} />
                    </Box>
                </Tooltip>

                <Tooltip title="Forest Guardian">
                    <Box sx={{
                        aspectRatio: '1',
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'help',
                        transition: 'all 0.3s',
                        '&:hover': {
                            borderColor: 'primary.main',
                            '& svg': { transform: 'scale(1.1)' }
                        }
                    }}>
                        <Park sx={{ color: 'primary.main', transition: 'transform 0.3s' }} />
                    </Box>
                </Tooltip>

                <Tooltip title="Whale Contributor">
                    <Box sx={{
                        aspectRatio: '1',
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'help',
                        transition: 'all 0.3s',
                        '&:hover': {
                            borderColor: 'secondary.main',
                            '& svg': { transform: 'scale(1.1)' }
                        }
                    }}>
                        <EmojiEvents sx={{ color: 'secondary.main', transition: 'transform 0.3s' }} />
                    </Box>
                </Tooltip>

                <Box sx={{
                    aspectRatio: '1',
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Lock sx={{ color: 'text.disabled', fontSize: '1rem' }} />
                </Box>
            </Box>
        </Box>
    );
};

export default ProjectBadges;
