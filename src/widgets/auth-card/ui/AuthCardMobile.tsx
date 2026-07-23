import { Segmented, theme, Typography } from 'antd'

import { SignInForm } from '@features/auth-login'
import { SignUpForm } from '@features/auth-register'
import logoUrl from '@shared/assets/logo.png'
import { useResolvedTheme } from '@shared/theme'

import type { AuthMode } from './AuthCard'

interface Props {
  mode: AuthMode
  onSwitch: (mode: AuthMode) => void
}

const MOBILE_LIGHT =
  '0 18px 40px rgba(20,24,20,0.12), 0 0 0 5px rgba(47,111,79,0.05)'
const MOBILE_DARK =
  '0 18px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(61,139,99,0.22), 0 0 0 5px rgba(47,111,79,0.08)'

/** Мобильная карточка: вместо overlay — переключатель-таб. */
export function AuthCardMobile({ mode, onSwitch }: Props) {
  const { token } = theme.useToken()
  const resolved = useResolvedTheme()
  const isSignIn = mode === 'signIn'

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        padding: 24,
        borderRadius: 20,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: resolved === 'dark' ? MOBILE_DARK : MOBILE_LIGHT,
      }}
    >
      <Segmented<AuthMode>
        block
        value={mode}
        onChange={onSwitch}
        options={[
          { label: 'Вход', value: 'signIn' },
          { label: 'Регистрация', value: 'signUp' },
        ]}
        style={{ marginBottom: 20 }}
      />

      <img
        src={logoUrl}
        alt=""
        width={44}
        height={44}
        style={{ objectFit: 'contain', display: 'block', marginBottom: 12 }}
      />
      <Typography.Title level={4} style={{ marginBottom: 4 }}>
        {isSignIn ? 'Вход в цифровой сад' : 'Создать сад'}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 20 }}>
        {isSignIn
          ? 'Продолжите развивать свои идеи и связи между заметками.'
          : 'Начните строить сеть связанных мыслей и знаний.'}
      </Typography.Paragraph>

      {isSignIn ? <SignInForm /> : <SignUpForm />}
    </div>
  )
}
