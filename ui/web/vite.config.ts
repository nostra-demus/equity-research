import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev: Vite serves the UI on 5173 and proxies /api to the Fastify control plane on 8787.
export default defineConfig({
  plugins: [react()],
  base: '/',
  // Build to ui/dist so Cloudflare Pages (root=ui, output=dist) serves it directly.
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Keep the heavy 3D stack (three.js + react-three) in its OWN chunk so it never bloats the main
    // bundle — combined with the lazy import of GlobeStage, it downloads only when the globe is opened.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('@react-three')) return 'three'
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    // PORT lets the cockpit-web preview entry (autoPort) assign a free port when 5173 is taken
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
})
