import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { makeBand, makeWordLeaf } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { GardenTree } from './GardenTree'

// PixiJS замокан в setup. Канвас — настоящий DOM-элемент, поэтому pointer/click
// события и геометрия hit-теста работают; сам рендер кроны проверяется вживую.

async function mountedCanvas(container: HTMLElement) {
  return waitFor(() => {
    const c = container.querySelector('canvas')
    if (!c) throw new Error('канвас ещё не смонтирован')
    return c as HTMLCanvasElement
  })
}

// Центр первой грозди в world-координатах — совпадает с первым листом (k=0).
// scale = 420/360, offset в jsdom = 0 → экранные координаты = world * scale.
const CX = Math.round((180 * 420) / 360)
const CY = Math.round((92 * 420) / 360)

describe('<GardenTree>', () => {
  it('монтирует контейнер дерева', async () => {
    const { container } = renderWithProviders(<GardenTree bands={[]} byId={{}} />)
    expect(container.querySelector('.garden-tree')).toBeTruthy()
    await mountedCanvas(container)
  })

  it('лист = слово: наведение подгружает слово, клик открывает карточку', async () => {
    const onSelectWord = vi.fn()
    const loadBandWords = vi
      .fn()
      .mockResolvedValue([makeWordLeaf({ id: 'en:go', lemma: 'go', status: 'KNOWN' })])

    const { container } = renderWithProviders(
      <GardenTree
        bands={[makeBand({ id: 'top-100', label: 'Топ-100', known: 5000, total: 5864 })]}
        byId={{}}
        onSelectWord={onSelectWord}
        loadBandWords={loadBandWords}
      />,
    )
    const canvas = await mountedCanvas(container)
    const move = () =>
      canvas.dispatchEvent(new MouseEvent('pointermove', { clientX: CX, clientY: CY, bubbles: true }))

    move()
    await waitFor(() =>
      expect(loadBandWords).toHaveBeenCalledWith('top-100', expect.any(Number)),
    )

    move()
    expect(await screen.findByText('go')).toBeInTheDocument()

    canvas.dispatchEvent(new MouseEvent('click', { clientX: CX, clientY: CY, bubbles: true }))
    expect(onSelectWord).toHaveBeenCalledWith('en:go')
  })

  it('вне кроны тултипа нет, увод курсора его скрывает', async () => {
    const { container } = renderWithProviders(
      <GardenTree bands={[makeBand({ label: 'Топ-100', known: 5000, total: 5864 })]} byId={{}} />,
    )
    const canvas = await mountedCanvas(container)

    canvas.dispatchEvent(new MouseEvent('pointermove', { clientX: 5, clientY: 5, bubbles: true }))
    expect(screen.queryByText('Топ-100')).not.toBeInTheDocument()

    canvas.dispatchEvent(new MouseEvent('pointerleave', { bubbles: true }))
    expect(screen.queryByText('Топ-100')).not.toBeInTheDocument()
  })
})
