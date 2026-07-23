import { Button, theme, Typography } from 'antd'
import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

import { SignInForm } from '@features/auth-login'
import { SignUpForm } from '@features/auth-register'
import { brand, useResolvedTheme } from '@shared/theme'

import {
  overlayVariants,
  signInVariants,
  signUpVariants,
  spring,
} from '../model/animations'
import type { AuthMode } from './AuthCard'

interface Props {
  mode: AuthMode
  onSwitch: (mode: AuthMode) => void
}

// Тень адаптируется под тему: на тёмном фоне чёрная тень невидима, поэтому
// добавляем глубину + зелёное кольцо-акцент вокруг фрейма (как в оригинале).
const LIGHT_SHADOW =
  '0 30px 60px rgba(20,24,20,0.12), 0 12px 24px rgba(20,24,20,0.08), 0 0 0 6px rgba(47,111,79,0.05)'
const DARK_SHADOW =
  '0 30px 70px rgba(0,0,0,0.60), 0 0 0 1px rgba(61,139,99,0.22), 0 0 0 7px rgba(47,111,79,0.09)'

const pane = (left: number | string): CSSProperties => ({
  position: 'absolute',
  top: 0,
  left,
  width: '50%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 56px',
  boxSizing: 'border-box',
})

function FormWrap({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        {subtitle}
      </Typography.Paragraph>
      {children}
    </div>
  )
}

function OverlaySide({
  title,
  text,
  button,
  onClick,
}: {
  title: string
  text: string
  button: string
  onClick: () => void
}) {
  return (
    <div style={{ maxWidth: 300 }}>
      <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ margin: '0 0 24px', opacity: 0.9, lineHeight: 1.6 }}>{text}</p>
      <Button
        ghost
        size="large"
        onClick={onClick}
        style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.85)' }}
      >
        {button}
      </Button>
    </div>
  )
}

/** Десктопная карточка: две формы + скользящий зелёный overlay. */
export function AuthCardDesktop({ mode, onSwitch }: Props) {
  const { token } = theme.useToken()
  const resolved = useResolvedTheme()
  const isSignIn = mode === 'signIn'

  return (
    <div
      style={{
        position: 'relative',
        width: 880,
        minHeight: 620,
        borderRadius: 24,
        overflow: 'hidden',
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: resolved === 'dark' ? DARK_SHADOW : LIGHT_SHADOW,
      }}
    >
      <motion.div
        style={pane(0)}
        variants={signInVariants}
        initial={false}
        animate={isSignIn ? 'active' : 'hidden'}
        transition={spring}
      >
        <FormWrap
          title="Вход в цифровой сад"
          subtitle="Продолжите развивать свои идеи и связи между заметками."
        >
          <SignInForm />
        </FormWrap>
      </motion.div>

      <motion.div
        style={pane('50%')}
        variants={signUpVariants}
        initial={false}
        animate={isSignIn ? 'hidden' : 'active'}
        transition={spring}
      >
        <FormWrap
          title="Создать сад"
          subtitle="Начните строить сеть связанных мыслей и знаний."
        >
          <SignUpForm />
        </FormWrap>
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '50%',
          height: '100%',
          zIndex: 10,
          overflow: 'hidden',
        }}
        variants={overlayVariants}
        initial={false}
        animate={mode}
        transition={spring}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 48px',
            textAlign: 'center',
            color: '#fff',
            background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryHover})`,
          }}
        >
          {isSignIn ? (
            <OverlaySide
              title="Нет сада?"
              text="Создайте пространство для своих идей и соединяйте мысли в единую сеть знаний."
              button="Создать сад"
              onClick={() => onSwitch('signUp')}
            />
          ) : (
            <OverlaySide
              title="Уже есть сад?"
              text="Вернитесь к своим заметкам и продолжайте развивать свою сеть знаний."
              button="Войти"
              onClick={() => onSwitch('signIn')}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
