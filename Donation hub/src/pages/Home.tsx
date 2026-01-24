import { Box } from '@mui/material';
import Hero from '../component/Hero';
import Stats from '../component/Stats';
import FeaturedProjects from '../component/FeaturedProjects';
import HowItWorks from '../component/HowItWorks';
import ContributionLevels from '../component/ContributionLevels';

const Home = () => {
  return (
    <Box>
      <Hero />
      <Stats />
      <FeaturedProjects />
      <HowItWorks />
      <ContributionLevels />
    </Box>
  );
};

export default Home;
