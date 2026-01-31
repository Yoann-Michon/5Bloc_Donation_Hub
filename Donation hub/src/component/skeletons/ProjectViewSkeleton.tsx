import { Box, Container, Skeleton, Paper } from '@mui/material';

const ProjectViewSkeleton = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Back Button Skeleton */}
            <Skeleton variant="text" width={120} height={40} sx={{ mb: 3 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
                {/* Main Content */}
                <Box>
                    {/* Header Image */}
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />

                    {/* Meta */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Box>
                                <Skeleton variant="text" width={100} />
                                <Skeleton variant="text" width={80} height={12} />
                            </Box>
                        </Box>
                        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="80%" />
                    </Box>

                    {/* Tabs */}
                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', gap: 2 }}>
                            <Skeleton variant="text" width={80} height={40} />
                            <Skeleton variant="text" width={80} height={40} />
                            <Skeleton variant="text" width={80} height={40} />
                        </Box>
                        <Skeleton variant="rectangular" height={200} />
                    </Paper>
                </Box>

                {/* Sidebar */}
                <Box>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            height: 300
                        }}
                    >
                        <Skeleton variant="text" height={50} width="60%" sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={10} sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Skeleton variant="text" width={50} />
                            <Skeleton variant="text" width={50} />
                            <Skeleton variant="text" width={50} />
                        </Box>
                        <Skeleton variant="rectangular" height={50} />
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
};

export default ProjectViewSkeleton;
