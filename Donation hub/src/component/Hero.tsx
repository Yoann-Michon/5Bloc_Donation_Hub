import { Box, Container, Typography, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import GradientText from './custom/GradientText';

const Hero = () => {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: 'background.paper',
        py: { xs: 6, md: 8, lg: 10 },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: { xs: 6, lg: 10 },
            alignItems: 'center',
          }}
        >
          {/* Text Content */}
          <Box sx={{ order: { xs: 2, md: 1 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <GradientText
                  colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
                  animationSpeed={6}
                  showBorder={false}
                  className="hero-title"
                >
                  <Typography
                    variant="h1"
                    component="span"
                    sx={{
                      fontWeight: 900,
                      display: 'block',
                      lineHeight: 1.1,
                      letterSpacing: '-0.033em',
                    }}
                  >
                    Empower Change with Blockchain Donations
                  </Typography>
                </GradientText>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 400,
                    fontSize: '1.125rem',
                    lineHeight: 1.6,
                    maxWidth: 500,
                  }}
                >
                  A fully decentralized platform for blockchain donations enabling transparency,
                  community growth, and direct impact on projects that matter.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 1 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    minWidth: 140,
                    height: 48,
                    fontSize: '1rem',
                    borderRadius: 1.5,
                  }}
                >
                  Explore Projects
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    minWidth: 140,
                    height: 48,
                    fontSize: '1rem',
                    borderColor: 'divider',
                    color: 'text.primary',
                    bgcolor: 'rgba(240, 240, 244, 0.5)',
                    '&:hover': {
                      borderColor: 'divider',
                      bgcolor: 'rgba(228, 228, 233, 0.8)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 2,
                }}
              >
                <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  Verified by Ethereum Smart Contracts
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Hero Image */}
          <Box sx={{ order: { xs: 1, md: 2 } }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4/3',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(103, 100, 242, 0.2)',
                '&:hover .hero-image': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top right, rgba(103, 100, 242, 0.2), transparent)',
                  mixBlendMode: 'overlay',
                  zIndex: 1,
                }}
              />
              <Box
                className="hero-image"
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBS_OmwzEox5WFnf1TKtgnY_2-XusOhtpK0oQ4S3Yn29RoRnnDB6rQa8iPr0xFxca4Uoe_I5mZDE1oPglLc9m3vauFaVUDZFH5hXvGYKOlal_p9cROt5lJRQxt5twKbmHm4GZt8fhlG88H5UKapQvB0TD1FitmKYuSUq6b1kbSur4JmXjo5fgaGmmqnJAkvgfT4nLzLgxHEGalHJwOzR0cSchSZHv5VU__rCWncintFRW8_wl_H-D-D0vHYSicQ3glhD8-9Jiq_u4I5")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.7s ease-out',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
