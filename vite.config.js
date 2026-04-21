import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
            // Группируем Ant Design и иконки в один файл
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'vendor-antd';
            }
            // Всё остальное (React, Axios и прочее) — во второй
            // Это исключит круговые зависимости между мелкими пакетами
            return 'vendor-core';
          }
        },
      },
    },
    // Оставляем лимит 1000кб, так как antd — парень тяжелый
    chunkSizeWarningLimit: 1000, 
  },
})