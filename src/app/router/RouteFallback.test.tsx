import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RouteFallback } from './RouteFallback'

describe('<RouteFallback>', () => {
  it('рендерит спиннер', () => {
    const { container } = render(<RouteFallback />)
    expect(container.querySelector('.ant-spin')).toBeTruthy()
  })
})
