import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PageHeader } from './PageHeader'

describe('<PageHeader>', () => {
  it('только title', () => {
    render(<PageHeader title="Настройки" />)
    expect(screen.getByText('Настройки')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('description и extra', () => {
    render(<PageHeader title="T" description="описание" extra={<button>действие</button>} />)
    expect(screen.getByText('описание')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'действие' })).toBeInTheDocument()
  })
})
