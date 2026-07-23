import { Button, Form, Select, Switch } from 'antd'
import { useEffect, useState } from 'react'

import { useUserStore } from '@entities/user'
import type { UserSettings } from '@shared/api'

/** Полный набор настроек с дефолтами (все обязательные поля контракта). */
const DEFAULTS: UserSettings = {
  theme: 'AUTO',
  interfaceLanguage: 'ru',
  profileVisibility: 'PRIVATE',
  emailNotifications: true,
  aiSuggestionsEnabled: true,
}

/** Форма пользовательских настроек (PUT /users/me/settings). */
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
      await updateSettings({ ...DEFAULTS, ...values })
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
      <Form.Item name="theme" label="Тема">
        <Select
          options={[
            { value: 'LIGHT', label: 'Светлая' },
            { value: 'DARK', label: 'Тёмная' },
            { value: 'AUTO', label: 'Системная' },
          ]}
        />
      </Form.Item>

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
