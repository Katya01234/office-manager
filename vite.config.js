import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  
  server: {
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 1. Оставляем ядро React в основном бандле
            if (
              id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('react-router') ||
              id.includes('scheduler') // Добавляем scheduler (нужен для React)
            ) {
              return null;
            }

            // 2. ВСЕ остальные библиотеки объединяем в ОДИН чанк vendor
            // Это уберет циклическую зависимость Circular chunk
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500, // Немного увеличим лимит, так как теперь чанк один
  },
})