import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    // Устанавливаем адрес и порт, которые просил партнер
    host: '127.0.0.1',
    port: 5500,
    strictPort: true, // Чтобы Vite не перекинул тебя на другой порт, если 5500 занят
    
    proxy: {
      '/api': {
        target: 'http://45.86.183.29:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})