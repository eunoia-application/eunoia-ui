import { describe, expect, it } from 'vitest'

import { isApiError } from './types'

describe('isApiError', () => {
  it('валидная форма → true', () => {
    expect(isApiError({ status: 401, code: 'unauthorized', message: 'нет доступа' })).toBe(true)
  })
  it('не-объект / null / undefined → false', () => {
    expect(isApiError(null)).toBe(false)
    expect(isApiError(undefined)).toBe(false)
    expect(isApiError('строка')).toBe(false)
    expect(isApiError(42)).toBe(false)
  })
  it('объект без обязательных полей → false', () => {
    expect(isApiError({})).toBe(false)
    expect(isApiError({ status: 1 })).toBe(false)
    expect(isApiError({ status: 1, code: 'x' })).toBe(false)
  })
})
