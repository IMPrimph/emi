import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // or a more specific path if you prefer
    // include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'], // default pattern
  },
})
