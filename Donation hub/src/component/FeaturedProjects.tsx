import { useState, useEffect } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import VortexProjectCard from './project/VortexProjectCard';
import ProjectCardSkeleton from './skeletons/ProjectCardSkeleton';
import { getProjects } from '../utils/api';
import { type Project } from '../types/project';

const FeaturedProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data.slice(0, 3));
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const featuredProjects = projects.map((project) => {
    const p = project as Project;
    const percentage = (p.raised / p.goal) * 100;
    let badge: 'Legendary' | 'Rare' | 'Epic' | 'Common' | 'New' = 'Common';
    let accentColor = '#10B981';

    if (percentage >= 90) {
      badge = 'Legendary';
      accentColor = '#5227FF';
    } else if (percentage >= 70) {
      badge = 'Epic';
      accentColor = '#A855F7';
    } else if (percentage >= 50) {
      badge = 'Rare';
      accentColor = '#FFD700';
    }

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      image: p.image,
      category: p.category,
      raised: p.raised,
      goal: p.goal,
      daysLeft: p.daysLeft,
      badge,
      accentColor
    };
  });

  return (
    <Box
      component="section"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            mb: 5,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                mb: 1,
              }}
            >
              Projets en vedette
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
              }}
            >
              Support the causes that resonate with you most.
            </Typography>
          </Box>

          <Button
            endIcon={<ArrowForward />}
            onClick={() => navigate('/projects')}
            sx={{
              display: { xs: 'none', md: 'flex' },
              color: 'primary.main',
              fontWeight: 700,
              '&:hover': {
                bgcolor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            View all projects
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {isLoading ? (
            Array.from(new Array(3)).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))
          ) : (
            featuredProjects.map((project) => (
              <VortexProjectCard
                key={project.id}
                {...project}
              />
            ))
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedProjects;
