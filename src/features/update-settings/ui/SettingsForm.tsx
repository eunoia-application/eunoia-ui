import { Button, Form, Select, Switch } from 'antd'
import { useEffect, useState } from 'react'

import { useUserStore } from '@entities/user'
import type { UserSettings } from '@shared/api'
import { themePreferenceFromMode, useThemeStore } from '@shared/theme'

/** Полный набор настроек с дефолтами (все обязательные поля контракта). */
const DEFAULTS: UserSettings = {
  theme: 'AUTO',
  interfaceLanguage: 'ru',
  profileVisibility: 'PRIVATE',
  emailNotifications: true,
  aiSuggestionsEnabled: true,
}

/**
 * Настройки аккаунта (PUT /users/me/settings). Тема здесь не дублируется —
 * ею управляет переключатель «Внешний вид»; при сохранении форма подставляет
 * текущую тему из стора, чтобы не затереть её на сервере.
 */
export function SettingsForm() {
  const [form] = Form.useForm()
  const settings = useUserStore((state) => state.profile?.settings)
  const updateSettings = useUserStore((state) => state.updateSettings)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    form.setFieldsValue({ ...DEFAULTS, ...settings })
  }, [settings, form])

  const onFinish = async (values: UserSettings) => {
    setLoading(true)
    try {
      await updateSettings({
        ...DEFAULTS,
        ...values,
        theme: themePreferenceFromMode(useThemeStore.getState().mode),
      })
    } catch {
      /* уведомление показывает стор */
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={DEFAULTS}
      onFinish={onFinish}
    >
      <Form.Item name="interfaceLanguage" label="Язык интерфейса">
        <Select
          options={[
            { value: 'ru', label: 'Русский' },
            { value: 'en', label: 'English' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="profileVisibility"
        label="Видимость профиля"
        tooltip="Публичный профиль доступен другим по ссылке /users/{id}"
      >
        <Select
          options={[
            { value: 'PRIVATE', label: 'Приватный' },
            { value: 'PUBLIC', label: 'Публичный' },
          ]}
        />
      </Form.Item>

      <Form.Item name="emailNotifications" label="Email-уведомления" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item name="aiSuggestionsEnabled" label="AI-подсказки" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" loading={loading}>
        Сохранить настройки
      </Button>
    </Form>
  )
}
