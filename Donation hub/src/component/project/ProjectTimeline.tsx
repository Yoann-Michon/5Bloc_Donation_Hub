import { Box, Typography } from '@mui/material';

const milestones = [
    { title: 'Seed Funding Smart Contract Released', tx: 'Tx: 0x9a2...3f1c', status: 'Triggered' },
    { title: 'Amazon Basin Phase 1 Planting', tx: 'Block #1824901', status: 'Triggered' },
    { title: 'Phase 2 Autonomous Verification', tx: 'Pending Oracle Confirmation', status: 'Locked' },
];

const ProjectTimeline = () => {
    return (
        <Box
            sx={{
                p: 4,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                mt: 4,
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 4 }}>
                Smart Contract Timeline
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pl: 3, borderLeft: '2px solid rgba(255, 255, 255, 0.1)', position: 'relative' }}>
                {milestones.map((milestone, index) => (
                    <Box key={index} sx={{ position: 'relative', opacity: milestone.status === 'Locked' ? 0.6 : 1 }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                left: -33,
                                top: 0,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: milestone.status === 'Locked' ? 'rgba(255,255,255,0.2)' : 'primary.main',
                                border: '4px solid #111022',
                                outline: milestone.status === 'Triggered' ? '4px solid rgba(82, 39, 255, 0.2)' : 'none',
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1, fontSize: '1rem' }}>
                                    {milestone.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontFamily: 'monospace' }}>
                                    {milestone.tx}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    bgcolor: milestone.status === 'Triggered' ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                    border: `1px solid ${milestone.status === 'Triggered' ? 'rgba(0, 242, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                                    color: milestone.status === 'Triggered' ? '#00f2ff' : 'text.secondary',
                                    fontSize: '0.625rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                }}
                            >
                                {milestone.status}
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default ProjectTimeline;
