import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@shared/test/render'

import { AppSidebar } from './AppSidebar'

describe('<AppSidebar>', () => {
  it('лого и пункты навигации', () => {
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    expect(screen.getByText('Eunoia')).toBeInTheDocument()
    expect(screen.getByText('Сад')).toBeInTheDocument()
    expect(screen.getByText('Настройки')).toBeInTheDocument()
  })

  it('клик по пункту не падает', async () => {
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    await userEvent.click(screen.getByText('Настройки'))
  })

  it('collapsed скрывает текст лого', () => {
    renderWithProviders(<AppSidebar collapsed onCollapse={vi.fn()} />)
    expect(screen.queryByText('Eunoia')).toBeNull()
  })
})
