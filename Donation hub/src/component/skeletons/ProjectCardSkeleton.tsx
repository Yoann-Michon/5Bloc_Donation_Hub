import { Card, CardContent, Box, Skeleton } from '@mui/material';

const ProjectCardSkeleton = () => {
    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            {/* Image Skeleton */}
            <Skeleton variant="rectangular" height={200} />

            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                {/* Category & Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="text" width={60} />
                </Box>

                {/* Title */}
                <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />

                {/* Author */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={100} />
                </Box>

                {/* Progress */}
                <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Skeleton variant="text" width={40} />
                        <Skeleton variant="text" width={40} />
                    </Box>
                    <Skeleton variant="rounded" height={6} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Skeleton variant="text" width={60} />
                    <Skeleton variant="text" width={60} />
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProjectCardSkeleton;
