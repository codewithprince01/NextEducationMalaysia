import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// The admin panel is not a site of its own — it is served by the Next app under
// /admin, so every asset URL and every router path is prefixed with it.
const BASE = '/admin/'

// Where the Next dev server is listening, used for the /api proxy when this dev
// server is opened directly on its own port instead of through Next.
const NEXT_ORIGIN = process.env.NEXT_ORIGIN || 'http://127.0.0.1:3000'

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Emitted straight into the Next app's public/ folder, so `next build`
    // ships the panel and Next serves /admin/assets/* as ordinary static files.
    outDir: path.resolve(import.meta.dirname, '../public/admin'),
    emptyOutDir: true,
  },
  server: {
    // Bind IPv4 explicitly: "localhost" can resolve to ::1 only, and Next's
    // dev rewrite dials 127.0.0.1, which then fails with ECONNREFUSED.
    host: '127.0.0.1',
    // 3000/3001 belong to the Next dev server; keep this clear of both.
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: NEXT_ORIGIN,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
