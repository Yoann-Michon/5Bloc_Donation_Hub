import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { Add, AutoFixHigh } from '@mui/icons-material';

interface Badge {
    id: number;
    name: string;
    tier: string;
    image: string;
}

interface FusionChamberProps {
    slots: (Badge | null)[];
    onRemove: (index: number) => void;
    onFuse: () => void;
    isFusing: boolean;
    canFuse: boolean;
}

const FusionChamber = ({ slots, onRemove, onFuse, isFusing, canFuse }: FusionChamberProps) => {
    return (
        <Box
            sx={{
                bgcolor: 'rgba(25, 24, 45, 0.6)',
                backdropFilter: 'blur(12px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Effects */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(82, 39, 255, 0.1) 0%, transparent 70%)',
                    zIndex: 0,
                }}
            />

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, zIndex: 1, fontFamily: 'Space Grotesk, sans-serif' }}>
                Fusion Chamber
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 6, zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
                Select 2 badges of the same tier to fuse them into a higher tier badge.
            </Typography>

            {/* Slots */}
            <Box sx={{ display: 'flex', gap: 4, mb: 6, zIndex: 1, position: 'relative' }}>
                {slots.map((badge, index) => (
                    <Box
                        key={index}
                        onClick={() => badge && onRemove(index)}
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            border: '2px dashed',
                            borderColor: badge ? 'primary.main' : 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: badge ? 'pointer' : 'default',
                            bgcolor: badge ? 'rgba(82, 39, 255, 0.1)' : 'transparent',
                            transition: 'all 0.3s',
                            position: 'relative',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'rgba(82, 39, 255, 0.05)',
                            }
                        }}
                    >
                        {badge ? (
                            <Box
                                component="img"
                                src={badge.image}
                                alt={badge.name}
                                sx={{ width: 64, height: 64, objectFit: 'contain' }}
                            />
                        ) : (
                            <Add sx={{ color: 'text.secondary', opacity: 0.5 }} />
                        )}

                        {/* Slot Number Label */}
                        <Typography
                            variant="caption"
                            sx={{
                                position: 'absolute',
                                bottom: -24,
                                color: 'text.secondary',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem'
                            }}
                        >
                            Slot {index + 1}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Fuse Button */}
            <Button
                variant="contained"
                size="large"
                disabled={!canFuse || isFusing}
                onClick={onFuse}
                startIcon={isFusing ? <CircularProgress size={20} color="inherit" /> : <AutoFixHigh />}
                sx={{
                    px: 6,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 10,
                    bgcolor: canFuse ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                    boxShadow: canFuse ? '0 0 30px rgba(82, 39, 255, 0.4)' : 'none',
                    '&:hover': {
                        bgcolor: canFuse ? 'primary.dark' : 'rgba(255, 255, 255, 0.05)',
                        boxShadow: canFuse ? '0 0 50px rgba(82, 39, 255, 0.6)' : 'none',
                    },
                    zIndex: 1,
                }}
            >
                {isFusing ? 'Fusing...' : 'Commence Fusion'}
            </Button>
        </Box>
    );
};

export default FusionChamber;
