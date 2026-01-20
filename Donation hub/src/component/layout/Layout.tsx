import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Particles from '../custom/Particles';

const Layout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
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

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: 280,
            flexShrink: 0,
          }}
        >
          <Sidebar />
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            height: '100vh',
            overflow: 'auto',
            p: { xs: 2, md: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
