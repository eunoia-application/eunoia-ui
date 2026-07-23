import { beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'

import { setupZodRu } from './zodSetup'

function firstMessage(result: z.SafeParseReturnType<unknown, unknown>): string {
  return result.success ? '' : result.error.issues[0]!.message
}

describe('setupZodRu', () => {
  beforeEach(() => setupZodRu())

  it('undefined required → «Обязательное поле»', () => {
    expect(firstMessage(z.object({ x: z.string() }).safeParse({}))).toBe('Обязательное поле')
  })
  it('null → «Обязательное поле»', () => {
    expect(firstMessage(z.string().safeParse(null))).toBe('Обязательное поле')
  })
  it('неверный тип (число) → «Некорректное значение»', () => {
    expect(firstMessage(z.string().safeParse(123))).toBe('Некорректное значение')
  })
  it('too_small min 1 → «Обязательное поле»', () => {
    expect(firstMessage(z.string().min(1).safeParse(''))).toBe('Обязательное поле')
  })
  it('too_small min 8 → «Минимум 8 символов»', () => {
    expect(firstMessage(z.string().min(8).safeParse('a'))).toBe('Минимум 8 символов')
  })
  it('too_small для числа → дефолт (не строковая ветка)', () => {
    expect(firstMessage(z.number().min(5).safeParse(1))).toBeTruthy()
  })
  it('прочие коды (email) → defaultError', () => {
    expect(firstMessage(z.string().email().safeParse('bad'))).toBeTruthy()
  })
})
