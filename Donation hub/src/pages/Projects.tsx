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
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = projects;


    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }


    switch (sortBy) {
      case 'newest':
        filtered = [...filtered].reverse();
        break;
      case 'funding':
        filtered = [...filtered].sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
        break;
      default:

        break;
    }

    return filtered;
  }, [projects, selectedCategory, sortBy]);

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
