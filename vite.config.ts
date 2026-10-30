import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // aviationweather.gov sends no CORS headers, so proxy it in dev
    proxy: {
      '/api': {
        target: 'https://aviationweather.gov',
        changeOrigin: true,
      },
    },
  },
})
