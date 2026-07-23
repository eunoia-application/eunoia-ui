import { describe, expect, it } from 'vitest'

import { themeModeFromPreference, themePreferenceFromMode } from './mapper'

describe('theme mapper', () => {
  it('preference → mode', () => {
    expect(themeModeFromPreference('LIGHT')).toBe('light')
    expect(themeModeFromPreference('DARK')).toBe('dark')
    expect(themeModeFromPreference('AUTO')).toBe('system')
  })
  it('mode → preference', () => {
    expect(themePreferenceFromMode('light')).toBe('LIGHT')
    expect(themePreferenceFromMode('dark')).toBe('DARK')
    expect(themePreferenceFromMode('system')).toBe('AUTO')
  })
})
