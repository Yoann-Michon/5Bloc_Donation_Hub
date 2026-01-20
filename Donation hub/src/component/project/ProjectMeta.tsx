import { Box, Typography, Button, IconButton } from '@mui/material';
import { ContentCopy, OpenInNew } from '@mui/icons-material';

interface ProjectMetaProps {
    author: string;
}

const ProjectMeta = ({ author }: ProjectMetaProps) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'start', md: 'center' },
                gap: 3,
                p: 3,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                mb: 4,
            }}
        >
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                <Box
                    sx={{
                        p: 0.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(82, 39, 255, 0.2)',
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundImage: 'url("https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=150&q=80")',
                        }}
                    />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
                        {author}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'text.secondary' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            0x71C...4e12
                        </Typography>
                        <IconButton size="small" sx={{ p: 0.5, color: 'inherit', '&:hover': { color: 'primary.main' } }}>
                            <ContentCopy sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ p: 0.5, color: 'inherit', '&:hover': { color: 'primary.main' } }}>
                            <OpenInNew sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
                <Button variant="outlined" sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    Share
                </Button>
                <Button variant="contained" sx={{ flex: 1, fontWeight: 700 }}>
                    Follow DAO
                </Button>
            </Box>
        </Box>
    );
};

export default ProjectMeta;
