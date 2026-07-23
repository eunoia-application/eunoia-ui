import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { GardenBackground } from './GardenBackground'

describe('<GardenBackground>', () => {
  it('рендерит фон с 28 листьями', () => {
    const { container } = render(<GardenBackground />)
    expect(container.firstChild).toBeTruthy()
    expect(container.querySelectorAll('svg')).toHaveLength(28)
  })
})
