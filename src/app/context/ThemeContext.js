import { Box } from '@mui/material';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export default function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState('light');

  // Load saved preference
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
      document.documentElement.setAttribute('data-theme', savedMode);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       setMode('dark');
       document.documentElement.setAttribute('data-theme', 'dark');
    } else {
       document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
           const newMode = prevMode === 'light' ? 'dark' : 'light';
           localStorage.setItem('themeMode', newMode);
           document.documentElement.setAttribute('data-theme', newMode);
           return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Modern Light Mode
                primary: { main: '#6C5CE7' }, // Modern Purple
                secondary: { main: '#00CEC9' }, // Teal
                background: { default: '#F8F9FD', paper: '#FFFFFF' },
                text: { primary: '#2D3436', secondary: '#636E72' },
              }
            : {
                // Modern Dark Mode - Expert UI/UX
                primary: { main: '#BB86FC' }, // Material Design 200 Purple (High contrast on dark)
                secondary: { main: '#03DAC6' }, // Material Design 200 Teal
                background: { default: '#121212', paper: '#1E1E1E' }, // Standard Material Dark Surface
                text: { primary: 'rgba(255, 255, 255, 0.87)', secondary: 'rgba(255, 255, 255, 0.60)' }, // Standard high-emphasis & medium-emphasis text
                divider: 'rgba(255, 255, 255, 0.12)',
                action: {
                    active: 'rgba(255, 255, 255, 0.56)',
                    hover: 'rgba(255, 255, 255, 0.08)',
                    selected: 'rgba(255, 255, 255, 0.16)',
                },
              }),
        },
        typography: {
          fontFamily: roboto.style.fontFamily,
          h5: { fontWeight: 700 },
          h6: { fontWeight: 600 },
          subtitle1: { fontWeight: 500 },
          body1: { lineHeight: 1.6 },
        },
        shape: {
          borderRadius: 16,
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 20,
                        boxShadow: mode === 'light'
                            ? '0 10px 40px -10px rgba(0,0,0,0.08)'
                            : '0 10px 40px -10px rgba(0,0,0,0.3)',
                        backgroundImage: 'none',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '10px 20px',
                        boxShadow: 'none',
                    },
                    contained: {
                        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                        },
                    }
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        backgroundImage: 'none',
                    }
                }
            },
             MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 12,
                        }
                    }
                }
            }
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            flex: 1,
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'background.default',
            color: 'text.primary',
            transition: 'background-color 0.3s ease, color 0.3s ease',
            overflowX: 'hidden'
          }}
        >
          {children}
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
