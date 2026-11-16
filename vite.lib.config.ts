import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// builds the npm package (src/lib) into dist-lib; `vite.config.ts` builds the website
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // keep native light-dark(): the transpiled fallback can't follow the theme prop
    cssTarget: ['chrome123', 'edge123', 'firefox120', 'safari17.5'],
    outDir: 'dist-lib',
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      entry: 'src/lib/entry.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
