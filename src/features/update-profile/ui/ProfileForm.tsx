import { Button, Form, Input } from 'antd'
import { useEffect, useState } from 'react'

import { useUserStore } from '@entities/user'
import { toFormFields } from '@shared/lib'

import { updateProfileSchema } from '../model/schema'
import type { UpdateProfileValues } from '../model/schema'

/** Редактирование профиля. Сохранение — оптимистичное (откат делает стор). */
export function ProfileForm() {
  const [form] = Form.useForm()
  const profile = useUserStore((state) => state.profile)
  const updateProfile = useUserStore((state) => state.updateProfile)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    form.setFieldsValue({
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      bio: profile?.bio,
      avatarUrl: profile?.avatarUrl,
    })
  }, [profile, form])

  const onFinish = async (values: UpdateProfileValues) => {
    const parsed = updateProfileSchema.safeParse(values)
    if (!parsed.success) {
      form.setFields(toFormFields(parsed.error))
      return
    }
    setLoading(true)
    try {
      await updateProfile(parsed.data)
    } catch {
      // уведомление и откат — в userStore.updateProfile
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={onFinish}>
      <Form.Item label="Email">
        <Input size="large" value={profile?.email} disabled />
      </Form.Item>

      <Form.Item name="firstName" label="Имя">
        <Input size="large" placeholder="Имя" />
      </Form.Item>

      <Form.Item name="lastName" label="Фамилия">
        <Input size="large" placeholder="Фамилия" />
      </Form.Item>

      <Form.Item name="bio" label="О себе">
        <Input.TextArea rows={3} maxLength={280} showCount placeholder="Пара слов о себе" />
      </Form.Item>

      <Form.Item name="avatarUrl" label="Ссылка на аватар">
        <Input size="large" placeholder="https://…" inputMode="url" />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" loading={loading}>
        Сохранить
      </Button>
    </Form>
  )
}
