import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CardSkeleton, FormSkeleton, ListSkeleton } from './Skeletons'

describe('skeletons', () => {
  it('CardSkeleton (дефолт и rows)', () => {
    const { container } = render(<CardSkeleton />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
    render(<CardSkeleton rows={5} />)
  })

  it('ListSkeleton рендерит count карточек', () => {
    const { container } = render(<ListSkeleton count={3} />)
    expect(container.querySelectorAll('.ant-skeleton').length).toBeGreaterThanOrEqual(3)
    render(<ListSkeleton />)
  })

  it('FormSkeleton рендерит поля', () => {
    const { container } = render(<FormSkeleton fields={3} />)
    expect(container.querySelectorAll('.ant-skeleton').length).toBeGreaterThan(0)
    render(<FormSkeleton />)
  })
})
