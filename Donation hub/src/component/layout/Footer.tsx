import { Box, Container, Typography, Link, IconButton } from '@mui/material';
import { Public, Chat, AlternateEmail } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#111118',
        color: 'white',
        py: 8,
        borderTop: '1px solid #2d2c4e',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 2fr' },
            gap: 6,
            mb: 6,
          }}
        >
          {/* Brand Column */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  color: 'primary.main',
                }}
              >
                <svg
                  className="w-full h-full"
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                    fill="currentColor"
                  />
                </svg>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '-0.015em',
                }}
              >
                Donation Hub
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#9ca3af',
                lineHeight: 1.6,
              }}
            >
              Empowering communities through transparent, decentralized philanthropy. Built on
              Ethereum.
            </Typography>
          </Box>

          {/* Platform Column */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#e5e7eb',
                mb: 2,
              }}
            >
              Platform
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                p: 0,
                m: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <li>
                <Link
                  href="/projects"
                  sx={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  sx={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/join-us"
                  sx={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  Join Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  sx={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  Leaderboard
                </Link>
              </li>
            </Box>
          </Box>

          {/* Governance Column */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#e5e7eb',
                mb: 2,
              }}
            >
              Governance
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                p: 0,
                m: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {['DAO Dashboard', 'Vote on Proposals', 'Treasury', 'Documentation'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    sx={{
                      color: '#9ca3af',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </Box>
          </Box>

          {/* Connect Column */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#e5e7eb',
                mb: 2,
              }}
            >
              Connect
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#1f2937',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                }}
              >
                <Public sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#1f2937',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                }}
              >
                <Chat sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#1f2937',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                }}
              >
                <AlternateEmail sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: '1px solid #374151',
            pt: 4,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
            }}
          >
            © 2023 Community Donation Hub DAO. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="#"
              sx={{
                color: '#6b7280',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'white',
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              sx={{
                color: '#6b7280',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'white',
                },
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
