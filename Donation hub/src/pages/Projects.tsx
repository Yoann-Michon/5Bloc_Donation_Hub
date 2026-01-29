import { useState, useMemo, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import ProjectCardSkeleton from '../component/skeletons/ProjectCardSkeleton';
import { getProjects, getCategories } from '../utils/api';
import type { Project } from '../types/project';
import HorizontalFilterBar from '../component/project/HorizontalFilterBar';
import VortexProjectCard from '../component/project/VortexProjectCard';

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('relevant');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, categoriesData] = await Promise.all([
          getProjects(),
          getCategories(),
        ]);
        setProjects(projectsData);
        setCategories(categoriesData.map((cat: any) => cat.name));
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered = [...filtered].reverse();
        break;
      case 'funding':
        filtered = [...filtered].sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
        break;
      default:
        // relevant - keep original order
        break;
    }

    return filtered;
  }, [selectedCategory, sortBy]);

  const getProjectVisuals = (id: number) => {
    const badges = ['Legendary', 'Rare', 'Epic', 'Common', 'New'];
    const colors = ['#5227FF', '#FFD700', '#A855F7', '#10B981', '#94A3B8'];
    const index = id % badges.length;
    return {
      badge: badges[index] as 'Legendary' | 'Rare' | 'Epic' | 'Common' | 'New',
      accentColor: colors[index],
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <HorizontalFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
              xl: viewMode === 'grid' ? 'repeat(4, 1fr)' : '1fr',
            },
            gap: 3,
            mb: 4,
          }}
        >
          {Array.from(new Array(6)).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </Box>
      ) : filteredProjects.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
              xl: viewMode === 'grid' ? 'repeat(4, 1fr)' : '1fr',
            },
            gap: 3,
            mb: 4,
          }}
        >
          {filteredProjects.map((project) => {
            const visuals = getProjectVisuals(project.id);
            return (
              <VortexProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                image={project.image}
                category={project.category}
                raised={project.raised}
                goal={project.goal}
                daysLeft={project.daysLeft}
                badge={visuals.badge}
                accentColor={visuals.accentColor}
              />
            );
          })}
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No projects found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Try adjusting your filters to see more results
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Projects;
