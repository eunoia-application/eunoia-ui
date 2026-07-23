import { Button, Form, Input } from 'antd'
import { useState } from 'react'

import { useSessionStore } from '@entities/session'
import { isApiError } from '@shared/api'
import { notify, toFormFields } from '@shared/lib'

import { loginSchema } from '../model/schema'
import type { LoginValues } from '../model/schema'

/** Форма входа. Валидация — zod, серверные ошибки — тостом (форма не смещается). */
export function SignInForm() {
  const [form] = Form.useForm()
  const login = useSessionStore((state) => state.login)
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginValues) => {
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      form.setFields(toFormFields(parsed.error))
      return
    }
    setLoading(true)
    try {
      await login(parsed.data)
    } catch (error) {
      notify.error(
        'Не удалось войти',
        isApiError(error) ? error.message : 'Попробуйте ещё раз',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={onFinish}
      autoComplete="on"
    >
      <Form.Item name="email" label="Email">
        <Input
          size="large"
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
        />
      </Form.Item>

      <Form.Item name="password" label="Пароль">
        <Input.Password
          size="large"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" block loading={loading}>
        Войти
      </Button>
    </Form>
  )
}
