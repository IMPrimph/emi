import { StrictMode, useMemo, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import DarkModeToggle from './components/DarkModeToggle.jsx'
import { setBodyTheme } from './utils/theme.js'

function Main() {
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('themeMode')
      if (stored) return stored
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    localStorage.setItem('themeMode', mode)
    setBodyTheme(mode)
  }, [mode])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#60A5FA' : '#2563eb',
            light: mode === 'dark' ? '#93C5FD' : '#3B82F6',
            dark: mode === 'dark' ? '#2563EB' : '#1D4ED8',
          },
          secondary: {
            main: mode === 'dark' ? '#818CF8' : '#6366F1',
            light: mode === 'dark' ? '#A5B4FC' : '#818CF8',
            dark: mode === 'dark' ? '#4F46E5' : '#4338CA',
          },
          background: {
            default: mode === 'dark' ? '#0F172A' : '#F8FAFC',
            paper: mode === 'dark' ? '#1E293B' : '#FFFFFF',
          },
          text: {
            primary: mode === 'dark' ? '#F1F5F9' : '#0F172A',
            secondary: mode === 'dark' ? '#CBD5E1' : '#475569',
          },
        },
        typography: {
          fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          },
          h2: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          },
          h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.2 },
          h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 },
          h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2 },
          h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
                padding: '8px 16px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                border: `1px solid ${mode === 'dark' ? '#2D3748' : '#E2E8F0'}`,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                },
              },
            },
          },
        },
      }),
    [mode],
  )

  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DarkModeToggle mode={mode} toggleMode={toggleMode} />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)