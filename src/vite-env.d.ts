/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// CSS-пакет шрифта без собственных типов — импортируется как side-effect.
declare module '@fontsource-variable/manrope'
