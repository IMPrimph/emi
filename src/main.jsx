import { StrictMode, useMemo, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import DarkModeToggle from './components/DarkModeToggle.jsx'
import { setBodyTheme } from './utils/theme.js'

function Main() {
  const [mode, setMode] = useState(() => {
    // Try to use system preference or localStorage
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
          primary: { main: '#3f51b5' },
          secondary: { main: '#ff6f00' },
          background: {
            default: mode === 'dark' ? '#181A20' : '#f5f5f5',
            paper: mode === 'dark' ? '#232634' : '#ffffff',
          },
          ...(mode === 'dark' && {
            text: {
              primary: '#F3F4F6',
              secondary: '#B0B3C6',
            },
          }),
        },
        typography: {
          fontFamily: 'Poppins, sans-serif',
          h3: { fontWeight: 700 },
          h4: { fontWeight: 600 },
          h5: { fontWeight: 500 },
        },
        shape: {
          borderRadius: 12,
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

// Register service worker for offline EMI calculations
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
