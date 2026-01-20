import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import Footer from './Footer';
import Particles from '../custom/Particles';

const PublicLayout = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Particles
          particleCount={150}
          particleSpread={10}
          speed={0.1}
          particleColors={['#5227FF', '#00E5FF', '#ffffff']}
          moveParticlesOnHover={true}
          particleHoverFactor={1}
          alphaParticles={true}
          particleBaseSize={100}
          sizeRandomness={1}
          cameraDistance={20}
          disableRotation={false}
          pixelRatio={1}
        />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <PublicHeader />
        <Box sx={{ height: 64 }} />

        <Outlet />

        <Footer />
      </Box>
    </Box>
  );
};

export default PublicLayout;
