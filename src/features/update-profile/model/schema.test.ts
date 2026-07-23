import { describe, expect, it } from 'vitest'

import { updateProfileSchema } from './schema'

describe('updateProfileSchema', () => {
  it('пустой объект валиден (все опциональны)', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true)
  })
  it('нормальные значения', () => {
    expect(updateProfileSchema.safeParse({ firstName: 'A', lastName: 'B', bio: 'hi' }).success).toBe(true)
  })
  it('слишком длинное имя', () => {
    expect(updateProfileSchema.safeParse({ firstName: 'x'.repeat(61) }).success).toBe(false)
  })
  it('слишком длинное bio', () => {
    expect(updateProfileSchema.safeParse({ bio: 'x'.repeat(281) }).success).toBe(false)
  })
})
