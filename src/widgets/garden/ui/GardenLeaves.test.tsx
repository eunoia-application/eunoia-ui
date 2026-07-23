import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MASTERY_META, useMasteryStore } from '@entities/mastery'
import { makeGardenLeaf, makeTopicView } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { GardenLeaves } from './GardenLeaves'

const base = {
  view: null,
  status: 'idle' as const,
  error: null,
  onOpen: vi.fn(),
  onRetry: vi.fn(),
}

afterEach(() => useMasteryStore.getState().reset())

describe('<GardenLeaves>', () => {
  it('loading без ветки → скелет', () => {
    const { container } = renderWithProviders(<GardenLeaves {...base} status="loading" />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('error без ветки → retry', async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <GardenLeaves
        {...base}
        status="error"
        error={{ status: 500, code: 'x', message: 'm' }}
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText('Не удалось раскрыть ветку')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('без выбранной ветки не рисует ни карточки, ни скелета', () => {
    const { container } = renderWithProviders(<GardenLeaves {...base} status="idle" />)
    expect(container.querySelector('.ant-card')).toBeNull()
    expect(container.querySelector('.ant-skeleton')).toBeNull()
  })

  it('ветка без слов → empty-state', () => {
    renderWithProviders(
      <GardenLeaves {...base} status="success" view={makeTopicView({ lexemes: [] })} />,
    )
    expect(screen.getByText('На этой ветке пока нет листьев')).toBeInTheDocument()
  })

  it('листья рисуются с легендой, клик открывает слово', async () => {
    const onOpen = vi.fn()
    renderWithProviders(
      <GardenLeaves {...base} status="success" view={makeTopicView()} onOpen={onOpen} />,
    )
    expect(screen.getByText('Путешествия')).toBeInTheDocument()
    expect(screen.getByText('A1')).toBeInTheDocument()

    await userEvent.click(screen.getByText('go'))
    expect(onOpen).toHaveBeenCalledWith('en:go:VERB')
  })

  it('локальная отметка перекрашивает лист', () => {
    useMasteryStore.setState({ byId: { 'en:go:VERB': 'KNOWN' } })
    renderWithProviders(
      <GardenLeaves
        {...base}
        status="success"
        view={makeTopicView({ lexemes: [makeGardenLeaf({ status: 'UNKNOWN' })] })}
      />,
    )
    // Иконка листа получает цвет статуса как атрибут SVG — его jsdom не нормализует.
    const leaf = screen.getByText('go').closest('button')
    expect(leaf?.querySelector('svg')?.getAttribute('stroke')).toBe(
      MASTERY_META.KNOWN.color,
    )
  })
})
