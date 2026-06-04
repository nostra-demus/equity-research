import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static build for Cloudflare Pages. Root directory: site · Build: npm run build · Output: dist
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: { host: '127.0.0.1', port: 4321 },
  preview: { host: '127.0.0.1', port: 4321 },
  build: { outDir: 'dist', emptyOutDir: true },
})
