import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: '/arena/app/air-defense/',
  build: {
    outDir: resolve(__dirname, '../../src/main/resources/static/arena/app/air-defense'),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.tsx'),
      output: {
        entryFileNames: 'air-defense-app.js',
        assetFileNames: (assetInfo) => assetInfo.name?.endsWith('.css')
          ? 'air-defense-app.css' : 'assets/[name]-[hash][extname]'
      }
    }
  }
})
