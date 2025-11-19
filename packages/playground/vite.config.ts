import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // ensures Vite resolves your local package
      'monaco-jsonata': path.resolve(__dirname, '../monaco-jsonata/src'),
    },
  },
  optimizeDeps: {
    include: ['monaco-jsonata'],
  },
})
