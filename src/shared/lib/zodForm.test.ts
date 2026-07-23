import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { toFormFields } from './zodForm'

describe('toFormFields', () => {
  it('группирует ошибки по имени поля', () => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
    const res = schema.safeParse({ email: 'bad', password: '1' })
    expect(res.success).toBe(false)
    if (res.success) return
    expect(toFormFields(res.error)).toEqual([
      { name: 'email', errors: expect.any(Array) },
      { name: 'password', errors: expect.any(Array) },
    ])
  })

  it('несколько ошибок на одно поле объединяются', () => {
    const schema = z.object({ x: z.string().min(5).regex(/^a/) })
    const res = schema.safeParse({ x: 'b' })
    if (res.success) return
    const fields = toFormFields(res.error)
    expect(fields).toHaveLength(1)
    expect(fields[0]!.errors.length).toBeGreaterThanOrEqual(2)
  })

  it('ошибка на корне (пустой path) → name «»', () => {
    const schema = z.object({ a: z.number() }).refine(() => false, { message: 'root' })
    const res = schema.safeParse({ a: 1 })
    if (res.success) return
    expect(toFormFields(res.error)[0]!.name).toBe('')
  })
})
