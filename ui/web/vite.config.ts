import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev: Vite serves the UI on 5173 and proxies /api to the Fastify control plane on 8787.
export default defineConfig({
  plugins: [react()],
  base: '/',
  // Build to ui/dist so Cloudflare Pages (root=ui, output=dist) serves it directly.
  build: { outDir: '../dist', emptyOutDir: true },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
})
