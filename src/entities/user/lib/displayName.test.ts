import { describe, expect, it } from 'vitest'

import { displayName, initials } from './displayName'

describe('displayName', () => {
  it('полное имя', () => {
    expect(
      displayName({ firstName: 'Alex', lastName: 'Johnson', username: 'u', email: 'e@x' }),
    ).toBe('Alex Johnson')
  })
  it('только firstName', () => {
    expect(displayName({ firstName: 'Alex', username: 'u', email: 'e@x' })).toBe('Alex')
  })
  it('null-имена → username', () => {
    expect(
      displayName({ firstName: null, lastName: null, username: 'boris', email: 'e@x' }),
    ).toBe('boris')
  })
  it('без имени/username → email', () => {
    expect(displayName({ username: '', email: 'e@x' })).toBe('e@x')
  })
  it('null/undefined → пусто', () => {
    expect(displayName(null)).toBe('')
    expect(displayName(undefined)).toBe('')
  })
})

describe('initials', () => {
  it('first + last', () => {
    expect(
      initials({ firstName: 'Alex', lastName: 'Johnson', username: 'u', email: 'e@x' }),
    ).toBe('AJ')
  })
  it('только first', () => {
    expect(initials({ firstName: 'Alex', username: 'u', email: 'e@x' })).toBe('A')
  })
  it('username фоллбэк', () => {
    expect(initials({ username: 'boris', email: 'e@x' })).toBe('B')
  })
  it('email фоллбэк', () => {
    expect(initials({ username: '', email: 'zed@x' })).toBe('Z')
  })
  it('null → «?»', () => {
    expect(initials(null)).toBe('?')
    expect(initials(undefined)).toBe('?')
  })
  it('всё пусто → «?»', () => {
    expect(initials({ username: '', email: '' })).toBe('?')
  })
})
