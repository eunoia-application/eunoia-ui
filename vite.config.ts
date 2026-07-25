import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  server: {
    port: 9000,
    host: 'localhost',
    proxy: {
      // Фронт бьёт по baseURL '/api/v1' (см. .env). Dev-прокси уводит /api/*
      // на бэкенд :7777 КАК ЕСТЬ → http://localhost:7777/api/v1/auth/login и т.п.
      '/api': {
        target: 'http://localhost:7777',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Разносим тяжёлые вендоры в отдельные чанки для кэшируемости.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-'))
            return 'antd'
          if (
            id.includes('react-router') ||
            id.includes('react-dom') ||
            id.includes('/react/') ||
            id.includes('scheduler')
          )
            return 'react'
          if (id.includes('framer-motion') || id.includes('/motion/')) return 'motion'
          // PixiJS импортится только динамически (Сад) — отдельный ленивый чанк.
          if (id.includes('pixi.js') || id.includes('/pixi/') || id.includes('@pixi'))
            return 'pixi'
          return 'vendor'
        },
      },
    },
  },
})
