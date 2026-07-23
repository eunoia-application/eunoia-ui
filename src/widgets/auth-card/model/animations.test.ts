import { describe, expect, it } from 'vitest'

import { overlayVariants, signInVariants, signUpVariants, spring } from './animations'

describe('auth-card animations', () => {
  it('spring и варианты определены', () => {
    expect(spring.duration).toBeGreaterThan(0)
    expect(signInVariants.active).toBeDefined()
    expect(signInVariants.hidden).toBeDefined()
    expect(signUpVariants.active).toBeDefined()
    expect(overlayVariants.signIn).toBeDefined()
    expect(overlayVariants.signUp).toBeDefined()
  })
})
