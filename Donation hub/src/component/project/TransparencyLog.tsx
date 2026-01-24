import { Box, Typography } from '@mui/material';
import { Storage } from '@mui/icons-material';

const TransparencyLog = () => {
    return (
        <Box
            sx={{
                p: 2,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderLeft: '4px solid rgba(0, 242, 255, 0.5)',
                borderRadius: 2,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Storage sx={{ fontSize: 14, color: '#00f2ff' }} />
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                    Live Transparency Feed
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem' }}>
                    <Typography component="span" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 'inherit' }}>
                        0x92...ff1
                    </Typography>
                    <Typography component="span" sx={{ color: '#00f2ff', fontWeight: 700, fontSize: 'inherit' }}>
                        +0.5 ETH
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem' }}>
                    <Typography component="span" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: 'inherit' }}>
                        0x12...c2d
                    </Typography>
                    <Typography component="span" sx={{ color: '#00f2ff', fontWeight: 700, fontSize: 'inherit' }}>
                        +2.1 ETH
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default TransparencyLog;
