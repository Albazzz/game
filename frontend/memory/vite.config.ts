import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: '/arena/app/memory/',
  build: {
    outDir: resolve(__dirname, '../../src/main/resources/static/arena/app/memory'),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.tsx'),
      output: {
        entryFileNames: 'memory-app.js',
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css') ? 'memory-app.css' : 'assets/[name]-[hash][extname]'
      }
    }
  }
})
