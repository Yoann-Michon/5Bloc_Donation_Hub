import { Box, Typography } from '@mui/material';
import { Verified } from '@mui/icons-material';

interface ProjectHeroProps {
    image: string;
    title: string;
}

const ProjectHero = ({ image, title }: ProjectHeroProps) => {
    return (
        <Box
            sx={{
                position: 'relative',
                height: 400,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                mb: 4,
            }}
        >
            
            <Box
                component="img"
                src={image}
                alt={title}
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
            
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 60%)',
                }}
            />

            
            <Box
                className="hologram-seal"
                sx={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(0,242,255,0.4) 0%, rgba(46,43,238,0.4) 50%, rgba(186,1,255,0.4) 100%)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transform: 'rotate(12deg)',
                    transition: 'transform 0.5s',
                    '&:hover': {
                        transform: 'rotate(0deg)',
                    },
                }}
            >
                <Verified sx={{ fontSize: 36, color: '#00f2ff', mb: 0.5 }} />
                <Typography variant="overline" sx={{ color: 'white', fontWeight: 700, lineHeight: 1, fontSize: '0.625rem' }}>
                    VERIFIED
                </Typography>
            </Box>

            
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, p: 4 }}>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            color: 'white',
                            fontSize: '0.625rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        Live On Chain
                    </Box>
                    <Box
                        sx={{
                            bgcolor: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        98% Match
                    </Box>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {title}
                </Typography>
            </Box>
        </Box>
    );
};

export default ProjectHero;
