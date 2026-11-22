import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // a new deploy takes over on the next load, no prompt
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon.png',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        name: 'JUST METAR',
        short_name: 'METAR',
        description: 'Latest METAR and TAF for any airport.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#fafafa',
        theme_color: '#fafafa',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // the app shell works offline; reports are never cached by the
        // service worker (favourites already live in localStorage)
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/_vercel\//],
        // Geist Mono comes from Google Fonts; keep it for offline use
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
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
