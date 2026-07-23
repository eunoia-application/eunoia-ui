import { Button, Form, Input } from 'antd'
import { useState } from 'react'

import { userApi } from '@entities/user'
import { isApiError } from '@shared/api'
import { notify, toFormFields } from '@shared/lib'

import { changePasswordSchema } from '../model/schema'
import type { ChangePasswordValues } from '../model/schema'

/** Смена пароля через реальный /users/me/password. */
export function ChangePasswordForm() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: ChangePasswordValues) => {
    const parsed = changePasswordSchema.safeParse(values)
    if (!parsed.success) {
      form.setFields(toFormFields(parsed.error))
      return
    }
    setLoading(true)
    try {
      await userApi.changePassword({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      })
      notify.success('Пароль обновлён')
      form.resetFields()
    } catch (error) {
      notify.error(
        'Не удалось изменить пароль',
        isApiError(error) ? error.message : undefined,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={onFinish}>
      <Form.Item name="currentPassword" label="Текущий пароль">
        <Input.Password size="large" autoComplete="current-password" />
      </Form.Item>

      <Form.Item name="newPassword" label="Новый пароль">
        <Input.Password size="large" autoComplete="new-password" />
      </Form.Item>

      <Form.Item name="confirm" label="Повторите пароль">
        <Input.Password size="large" autoComplete="new-password" />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" loading={loading}>
        Изменить пароль
      </Button>
    </Form>
  )
}
