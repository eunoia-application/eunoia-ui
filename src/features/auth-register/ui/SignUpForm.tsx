import { Button, Form, Input } from 'antd'
import { useState } from 'react'

import { useSessionStore } from '@entities/session'
import { isApiError } from '@shared/api'
import { notify, toFormFields } from '@shared/lib'

import { registerSchema } from '../model/schema'
import type { RegisterValues } from '../model/schema'

/** Форма регистрации. Валидация — zod, серверные ошибки — тостом. */
export function SignUpForm() {
  const [form] = Form.useForm()
  const register = useSessionStore((state) => state.register)
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: RegisterValues) => {
    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      form.setFields(toFormFields(parsed.error))
      return
    }
    setLoading(true)
    try {
      await register(parsed.data)
    } catch (error) {
      notify.error(
        'Не удалось зарегистрироваться',
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
      <Form.Item name="firstName" label="Имя">
        <Input size="large" placeholder="Как к вам обращаться" autoComplete="given-name" />
      </Form.Item>

      <Form.Item name="username" label="Имя пользователя">
        <Input size="large" placeholder="username" autoComplete="username" />
      </Form.Item>

      <Form.Item name="email" label="Email">
        <Input size="large" placeholder="you@example.com" autoComplete="email" inputMode="email" />
      </Form.Item>

      <Form.Item name="password" label="Пароль">
        <Input.Password
          size="large"
          placeholder="Минимум 8 символов"
          autoComplete="new-password"
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" block loading={loading}>
        Зарегистрироваться
      </Button>
    </Form>
  )
}
