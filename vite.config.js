import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (
              id.includes('react-markdown') ||
              id.includes('remark-gfm') ||
              id.includes('micromark') ||
              id.includes('mdast') ||
              id.includes('unist')
            ) {
              return 'vendor-markdown';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'vendor-icons';
            }
            return 'vendor-core';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
