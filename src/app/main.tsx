import '@fontsource-variable/manrope'
import '@ant-design/v5-patch-for-react-19'
import './styles/global.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { bindSessionToApi } from '@entities/session'
import { setupZodRu } from '@shared/lib'

import { AppProviders } from './providers'

// Русские дефолты валидации + связывание сессии с axios — до первого рендера.
setupZodRu()
bindSessionToApi()

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
