import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },

  build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          dnd: ['@hello-pangea/dnd'],
          socket: ['socket.io-client'],
        }
      }
    }
  }
})