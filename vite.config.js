import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // master root alias
      '@': path.resolve(__dirname, './src'),
      
      // folder-specific aliases
      '@components': path.resolve(__dirname, './src/components'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@modals': path.resolve(__dirname, './src/components/modals'),
      '@layout': path.resolve(__dirname, './src/components/layout'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@tabs': path.resolve(__dirname, './src/tabs'),      
    },
  },
})