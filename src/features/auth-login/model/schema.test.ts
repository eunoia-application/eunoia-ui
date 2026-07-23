import { describe, expect, it } from 'vitest'

import { loginSchema } from './schema'

describe('loginSchema', () => {
  it('валидные данные', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true)
  })
  it('плохой email', () => {
    expect(loginSchema.safeParse({ email: 'bad', password: 'x' }).success).toBe(false)
  })
  it('пустой пароль', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false)
  })
})
