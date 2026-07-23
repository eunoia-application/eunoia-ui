import { describe, expect, it } from 'vitest'

import { registerSchema } from './schema'

describe('registerSchema', () => {
  it('валидные данные', () => {
    expect(
      registerSchema.safeParse({
        username: 'eunoia_user',
        email: 'a@b.co',
        password: 'password1',
      }).success,
    ).toBe(true)
  })
  it('короткий username', () => {
    expect(registerSchema.safeParse({ username: 'ab', email: 'a@b.co', password: 'password1' }).success).toBe(false)
  })
  it('недопустимые символы в username', () => {
    expect(registerSchema.safeParse({ username: 'bad name', email: 'a@b.co', password: 'password1' }).success).toBe(false)
  })
  it('короткий пароль', () => {
    expect(registerSchema.safeParse({ username: 'eunoia', email: 'a@b.co', password: 'short' }).success).toBe(false)
  })
})
