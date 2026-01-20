import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5227FF',
      light: '#B19EEF',
      dark: '#2c148a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00E5FF',
      light: '#6effff',
      dark: '#00b2cc',
      contrastText: '#000000',
    },
    background: {
      default: '#060010',
      paper: '#0b001a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    success: {
      main: '#00F090',
    },
    info: {
      main: '#5227FF',
    },
    warning: {
      main: '#FFCC00',
    },
    error: {
      main: '#FF2E54',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Outfit', sans-serif",
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(to right, #ffffff, #b0b0b0)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 8, // Reduced from 16 to 8 for sharper luxury look
  },
  spacing: 8, // Default MUI spacing, but we'll use smaller multipliers
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#060010',
          scrollbarColor: '#333 #060010',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#060010',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#333',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Reduced from 50 for sharper look
          padding: '8px 20px', // Reduced padding
          textTransform: 'none',
          backdropFilter: 'blur(4px)',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #5227FF 0%, #7C4DFF 100%)',
          boxShadow: '0 0 20px rgba(82, 39, 255, 0.4)',
          '&:hover': {
            boxShadow: '0 0 30px rgba(82, 39, 255, 0.6)',
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.2)',
          '&:hover': {
            borderColor: '#fff',
            backgroundColor: 'rgba(255,255,255,0.05)',
          },
        },
        sizeLarge: {
          padding: '10px 24px', // Slightly larger but still compact
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(11, 0, 26, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'none',
          borderRadius: 8, // Consistent sharp radius
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px', // Reduced from default 16px
          '&:last-child': {
            paddingBottom: '16px', // Consistent padding
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(6, 0, 16, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 8, // Consistent sharp radius
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px', // Tighter container padding
          paddingRight: '16px',
        },
      },
    },
  },
});

export default theme;
