import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as RouterDom from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useBandStore } from '@entities/band'
import { useMasteryStore } from '@entities/mastery'
import { useSessionStore } from '@entities/session'
import { wordApi } from '@entities/word'
import { makeAuthUser, makeBand, makeWordCard, makeWordPage } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { HomePage } from './HomePage'

const navigate = vi.fn()

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof RouterDom>()
  return { ...actual, useNavigate: () => navigate }
})

// Дерево — тяжёлый Pixi-виджет; здесь подменяем его заглушкой, дёргающей колбэки,
// чтобы проверить обвязку страницы (навигация, карточка, ленивая загрузка).
vi.mock('@widgets/garden-tree', () => ({
  GardenTree: ({
    onSelectBand,
    onSelectWord,
    loadBandWords,
  }: {
    onSelectBand?: (id: string) => void
    onSelectWord?: (id: string) => void
    loadBandWords?: (id: string, limit: number) => Promise<unknown>
  }) => (
    <div>
      <div className="garden-tree" />
      <button onClick={() => onSelectBand?.('top-100')}>pick-band</button>
      <button onClick={() => onSelectWord?.('en:go')}>pick-word</button>
      <button onClick={() => void loadBandWords?.('top-100', 5)}>pick-load</button>
    </div>
  ),
}))

afterEach(() => {
  useBandStore.getState().reset()
  useMasteryStore.getState().reset()
  navigate.mockReset()
  vi.restoreAllMocks()
})

describe('<HomePage>', () => {
  it('приветствие + дерево, грузит блоки и прогресс', () => {
    const fetchBands = vi.fn()
    const fetchMine = vi.fn()
    useSessionStore.setState({ user: makeAuthUser({ username: 'boris' }) })
    useBandStore.setState({ fetchBands, bands: [makeBand()], status: 'success' })
    useMasteryStore.setState({ fetchMine })

    const { container } = renderWithProviders(<HomePage />)

    expect(screen.getByText(/Здравствуйте/)).toBeInTheDocument()
    expect(container.querySelector('.garden-tree')).toBeTruthy()
    expect(fetchBands).toHaveBeenCalled()
    expect(fetchMine).toHaveBeenCalled()
  })

  it('кнопки и ветки ведут в разделы', async () => {
    useSessionStore.setState({ user: makeAuthUser() })
    useBandStore.setState({ fetchBands: vi.fn(), bands: [makeBand()], status: 'success' })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<HomePage />)

    await userEvent.click(screen.getByRole('button', { name: /К словам/ }))
    expect(navigate).toHaveBeenCalledWith('/words')

    await userEvent.click(screen.getByRole('button', { name: /Учить/ }))
    expect(navigate).toHaveBeenCalledWith('/study')

    await userEvent.click(screen.getByRole('button', { name: 'pick-band' }))
    expect(navigate).toHaveBeenCalledWith('/words')
  })

  it('лист открывает карточку слова, ленивая загрузка уходит в API', async () => {
    const listSpy = vi.spyOn(wordApi, 'list').mockResolvedValue(makeWordPage())
    vi.spyOn(wordApi, 'getCard').mockResolvedValue(makeWordCard())
    useSessionStore.setState({ user: makeAuthUser() })
    useBandStore.setState({ fetchBands: vi.fn(), bands: [makeBand()], status: 'success' })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<HomePage />)

    await userEvent.click(screen.getByRole('button', { name: 'pick-load' }))
    expect(listSpy).toHaveBeenCalledWith({ band: 'top-100', limit: 5 })

    await userEvent.click(screen.getByRole('button', { name: 'pick-word' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    const closeBtn = document.querySelector('.ant-modal-close') as HTMLElement
    await userEvent.click(closeBtn)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
