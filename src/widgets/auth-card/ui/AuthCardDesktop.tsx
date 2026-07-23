import { Button, Flex, theme, Typography } from 'antd'
import { motion } from 'framer-motion'
import { Bot, Leaf, Sprout, TreePine, Waypoints } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

import { SignInForm } from '@features/auth-login'
import { SignUpForm } from '@features/auth-register'
import logoUrl from '@shared/assets/logo.png'
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

interface OverlayItem {
  icon: ReactNode
  label: string
}

// «Нет сада?» — продаём регистрацию (фишки); «Уже есть сад?» — напоминаем метафору.
const OFFER_ITEMS: OverlayItem[] = [
  { icon: <Sprout size={16} />, label: 'Сад вместо уроков' },
  { icon: <Leaf size={16} />, label: 'Живая память слов' },
  { icon: <Bot size={16} />, label: 'AI-садовник рядом' },
]

const ABOUT_ITEMS: OverlayItem[] = [
  { icon: <TreePine size={16} />, label: 'Дерево — область знаний' },
  { icon: <Waypoints size={16} />, label: 'Ветки — ваши темы' },
  { icon: <Leaf size={16} />, label: 'Листья — освоенные слова' },
]

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
  logo,
  centered,
  children,
}: {
  title: string
  subtitle: string
  logo?: boolean
  centered?: boolean
  children: ReactNode
}) {
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      {logo && (
        <div
          style={{
            width: 72,
            height: 72,
            margin: '0 auto 18px',
            borderRadius: '50%',
            background: brand.primarySoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={logoUrl}
            alt=""
            width={48}
            height={48}
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}
      <Typography.Title
        level={3}
        style={{ marginBottom: 8, textAlign: logo || centered ? 'center' : undefined }}
      >
        {title}
      </Typography.Title>
      <Typography.Paragraph
        type="secondary"
        style={{ marginBottom: 24, textAlign: logo || centered ? 'center' : undefined }}
      >
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
  logo,
  items,
  onClick,
}: {
  title: string
  text: string
  button: string
  logo?: boolean
  items: OverlayItem[]
  onClick: () => void
}) {
  return (
    <div style={{ maxWidth: 300 }}>
      {logo && (
        <div
          style={{
            width: 72,
            height: 72,
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
          }}
        >
          <img
            src={logoUrl}
            alt=""
            width={48}
            height={48}
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}
      <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ margin: '0 0 20px', opacity: 0.9, lineHeight: 1.55 }}>{text}</p>
      <Flex vertical gap={10} style={{ margin: '0 0 28px' }}>
        {items.map((item) => (
          <Flex
            key={item.label}
            align="center"
            gap={12}
            style={{
              padding: '10px 14px',
              borderRadius: 14,
              textAlign: 'left',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.16)',
              }}
            >
              {item.icon}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>
              {item.label}
            </span>
          </Flex>
        ))}
      </Flex>
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
          subtitle="Возвращайтесь в сад — продолжайте растить свои знания."
          logo
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
          subtitle="Посадите первое дерево и выращивайте знания как живой сад."
          centered
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
              text="Заведите пространство, где знания растут:"
              button="Создать сад"
              items={OFFER_ITEMS}
              onClick={() => onSwitch('signUp')}
            />
          ) : (
            <OverlaySide
              title="Уже есть сад?"
              text="Возвращайтесь и продолжайте растить свой сад:"
              button="Войти"
              logo
              items={ABOUT_ITEMS}
              onClick={() => onSwitch('signIn')}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
