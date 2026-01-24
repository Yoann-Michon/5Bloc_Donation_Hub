import { Box, Button, Typography } from '@mui/material';

interface HorizontalFilterBarProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

const HorizontalFilterBar = ({
    categories,
    selectedCategory,
    onCategoryChange,
    sortBy,
    onSortChange
}: HorizontalFilterBarProps) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                pb: 3,
                mb: 4,
            }}
        >
            {/* Categories */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
                <Button
                    onClick={() => onCategoryChange('All')}
                    sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        bgcolor: selectedCategory === 'All' ? 'rgba(82, 39, 255, 0.2)' : 'rgba(25, 24, 45, 0.6)',
                        color: selectedCategory === 'All' ? 'white' : 'text.secondary',
                        border: '1px solid',
                        borderColor: selectedCategory === 'All' ? 'rgba(82, 39, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        '&:hover': {
                            bgcolor: selectedCategory === 'All' ? 'rgba(82, 39, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                        },
                    }}
                >
                    All Sectors
                </Button>

                {categories.map((category) => (
                    <Button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        sx={{
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            bgcolor: selectedCategory === category ? 'rgba(82, 39, 255, 0.2)' : 'rgba(25, 24, 45, 0.6)',
                            color: selectedCategory === category ? 'white' : 'text.secondary',
                            border: '1px solid',
                            borderColor: selectedCategory === category ? 'rgba(82, 39, 255, 0.5)' : 'transparent',
                            backdropFilter: 'blur(12px)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                            },
                        }}
                    >
                        {category}
                    </Button>
                ))}
            </Box>

            {/* Sort By */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    SORT BY:
                </Typography>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#cbd5e1', // slate-300
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none',
                    }}
                >
                    <option value="relevant">Trending Now</option>
                    <option value="newest">Newest</option>
                    <option value="funding">Goal Reached</option>
                </select>
            </Box>
        </Box>
    );
};

export default HorizontalFilterBar;
