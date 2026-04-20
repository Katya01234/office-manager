import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    // Твои настройки для порта 5500
    host: '127.0.0.1',
    port: 5500,
    strictPort: true, 
    
    proxy: {
      '/api': {
        target: 'http://45.86.183.29:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Эта функция разбивает код на части
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, 
  },
})