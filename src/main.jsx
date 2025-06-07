import { StrictMode, useMemo, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import DarkModeToggle from './components/DarkModeToggle.jsx'
import { setBodyTheme } from './utils/theme.js'
import './index.css'
import './App.css'

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
          divider: mode === 'dark' ? '#334155' : '#E2E8F0',
          action: {
            active: mode === 'dark' ? '#60A5FA' : '#2563eb',
            hover: mode === 'dark' ? '#1E293B' : '#F1F5F9',
          },
        },
        typography: {
          fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
          },
          h2: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
          },
          h3: { 
            fontWeight: 600, 
            fontSize: '1.75rem', 
            lineHeight: 1.2,
            color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
          },
          h4: { 
            fontWeight: 600, 
            fontSize: '1.5rem', 
            lineHeight: 1.2,
            color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
          },
          h5: { 
            fontWeight: 600, 
            fontSize: '1.25rem', 
            lineHeight: 1.2,
            color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
          },
          h6: { 
            fontWeight: 600, 
            fontSize: '1rem', 
            lineHeight: 1.2,
            color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
                color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
              },
            },
          },
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
                  opacity: 0.9,
                },
                '&.MuiButton-contained': {
                  backgroundColor: mode === 'dark' ? '#60A5FA' : '#2563eb',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? '#3B82F6' : '#1D4ED8',
                  },
                },
                '&.MuiButton-outlined': {
                  borderColor: mode === 'dark' ? '#60A5FA' : '#2563eb',
                  color: mode === 'dark' ? '#60A5FA' : '#2563eb',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                  },
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
                borderColor: mode === 'dark' ? '#334155' : '#E2E8F0',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                border: `1px solid ${mode === 'dark' ? '#334155' : '#E2E8F0'}`,
                backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
                  '& fieldset': {
                    borderColor: mode === 'dark' ? '#334155' : '#E2E8F0',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? '#60A5FA' : '#3B82F6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? '#60A5FA' : '#3B82F6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: mode === 'dark' ? '#CBD5E1' : '#475569',
                },
                '& .MuiInputBase-input': {
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                },
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: `1px solid ${mode === 'dark' ? '#334155' : '#E2E8F0'}`,
                color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
              },
              head: {
                backgroundColor: mode === 'dark' ? '#1E293B' : '#F8FAFC',
                color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                fontWeight: 600,
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                backgroundColor: mode === 'dark' ? '#2D3748' : '#1E293B',
                color: '#F8FAFC',
                fontSize: '0.875rem',
                padding: '8px 12px',
                borderRadius: 6,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#2D3748' : '#F1F5F9',
                color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                '&.MuiChip-clickable:hover': {
                  backgroundColor: mode === 'dark' ? '#374151' : '#E2E8F0',
                },
              },
              deleteIcon: {
                color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                '&:hover': {
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                },
              },
            },
          },
          MuiSlider: {
            styleOverrides: {
              root: {
                color: mode === 'dark' ? '#60A5FA' : '#2563eb',
              },
              thumb: {
                backgroundColor: '#FFFFFF',
                border: `2px solid ${mode === 'dark' ? '#60A5FA' : '#2563eb'}`,
              },
              track: {
                backgroundColor: mode === 'dark' ? '#60A5FA' : '#2563eb',
              },
              rail: {
                backgroundColor: mode === 'dark' ? '#334155' : '#E2E8F0',
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
      <div style={{margin: '16px'}}>
      <DarkModeToggle mode={mode} toggleMode={toggleMode} />
      <App />
      </div>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)