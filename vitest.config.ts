import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

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
  test: {
    // jsdom для всего: stores используют localStorage, компоненты — DOM/antd.
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/shared/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/index.ts',
        'src/shared/test/**',
        'src/shared/api/contracts/**',
        'src/entities/session/model/types.ts', // type-only, без рантайма
        'src/features/manage-avatar/lib/cropImage.ts', // canvas, недоступен в jsdom
        'src/features/manage-avatar/ui/AvatarCropModal.tsx', // react-easy-crop/DOM
        'src/widgets/garden-tree/ui/GardenTree.tsx', // PixiJS/WebGL, недоступен в jsdom
        'src/app/main.tsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        lines: 99,
        functions: 99,
        branches: 97,
        statements: 99,
      },
    },
  },
})
