import { Button, Flex, Tooltip } from 'antd'
import type { LucideIcon } from 'lucide-react'
import { Monitor, Moon, Sun } from 'lucide-react'

import { useThemeStore } from '@shared/theme'
import type { ThemeMode } from '@shared/theme'

const OPTIONS: { value: ThemeMode; label: string; Icon: LucideIcon }[] = [
  { value: 'light', label: 'Светлая', Icon: Sun },
  { value: 'system', label: 'Система', Icon: Monitor },
  { value: 'dark', label: 'Тёмная', Icon: Moon },
]

/** Переключатель темы: три круглые кнопки (светлая / система / тёмная). */
export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)

  return (
    <Flex gap={6}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <Tooltip key={value} title={label}>
          <Button
            shape="circle"
            aria-label={label}
            type={mode === value ? 'primary' : 'text'}
            onClick={() => setMode(value)}
            icon={<Icon size={18} strokeWidth={2} style={{ display: 'block' }} />}
          />
        </Tooltip>
      ))}
    </Flex>
  )
}
