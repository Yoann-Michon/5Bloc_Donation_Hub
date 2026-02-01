import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
} from '@mui/material';
import ProjectViewSkeleton from '../component/skeletons/ProjectViewSkeleton';
import { getProject } from '../utils/api';
import DonationModal from '../component/DonationModal';
import type { Project } from '../types/project';
import ProjectHero from '../component/project/ProjectHero';
import ProjectMeta from '../component/project/ProjectMeta';
import ProjectTabs from '../component/project/ProjectTabs';
import ProjectDonationCard from '../component/project/ProjectDonationCard';
import ProjectBadges from '../component/project/ProjectBadges';
import TransparencyLog from '../component/project/TransparencyLog';

const ProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isDashboard = location.pathname.startsWith('/dashboard');
  const projectsPath = isDashboard ? '/dashboard/projects' : '/projects';

  const [project, setProject] = useState<Project | undefined>();

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        const data = await getProject(Number(id));
        setProject(data);
      } catch (error) {

      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (isLoading) {
    return <ProjectViewSkeleton />;
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Project not found
        </Typography>
        <Button variant="contained" onClick={() => navigate(projectsPath)}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  const percentage = Math.round((project.raised / project.goal) * 100);

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, lg: 10 } }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
        <Typography
          onClick={() => navigate(projectsPath)}
          sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', '&:hover': { color: 'white' } }}
        >
          Projects
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>/</Typography>
        <Typography sx={{ color: 'primary.main', fontSize: '0.875rem', fontWeight: 500 }}>
          {project.title} Detail
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' }, gap: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <ProjectHero image={project.image} title={project.title} />

          <ProjectMeta author={project.author} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ProjectTabs project={project} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ProjectDonationCard
            project={project}
            percentage={percentage}
            onDonate={() => setDonationModalOpen(true)}
          />
          <ProjectBadges />
          <TransparencyLog />
        </Box>
      </Box>

      <DonationModal
        open={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        project={{
          id: project.id,
          title: project.title,
          author: project.author,
          image: project.image,
        }}
      />
    </Container>
  );
};

export default ProjectView;
