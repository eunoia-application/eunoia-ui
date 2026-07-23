import { useState } from 'react'

import { useMediaQuery } from '@shared/lib'

import { AuthCardDesktop } from './AuthCardDesktop'
import { AuthCardMobile } from './AuthCardMobile'

export type AuthMode = 'signIn' | 'signUp'

/** Карточка авторизации: split-overlay на десктопе, табы на мобиле. */
export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>('signIn')
  const isMobile = useMediaQuery('(max-width: 760px)')

  return isMobile ? (
    <AuthCardMobile mode={mode} onSwitch={setMode} />
  ) : (
    <AuthCardDesktop mode={mode} onSwitch={setMode} />
  )
}
