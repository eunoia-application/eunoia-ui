import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { makeBand, makeWordLeaf } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { CLUSTER_CAPACITY } from '../lib/constants'
import { GardenTree, type GardenPick } from './GardenTree'

// WebGL-сцена в jsdom не работает — подменяем канвас пультом, который дёргает
// те же колбэки наведения/клика, что и настоящий raycast по кроне.
vi.mock('./scene/GardenCanvas', () => ({
  default: (props: {
    bands: { id: string }[]
    onPick: (p: GardenPick | null) => void
    onSelect: (p: GardenPick) => void
  }) => {
    if (props.bands[0]?.id === 'boom') throw new Error('no webgl')
    const band: GardenPick = { kind: 'band', cluster: 0, local: -1, sx: 40, sy: 30 }
    const leaf: GardenPick = { kind: 'leaf', cluster: 0, local: 0, sx: 42, sy: 31 }
    const ghost: GardenPick = { kind: 'band', cluster: 3, local: -1, sx: 5, sy: 5 }
    return (
      <div data-testid="scene">
        <button onClick={() => props.onPick(band)}>hover-band</button>
        <button onClick={() => props.onPick(leaf)}>hover-leaf</button>
        <button onClick={() => props.onPick(ghost)}>hover-ghost</button>
        <button onClick={() => props.onPick(null)}>leave</button>
        <button onClick={() => props.onSelect(leaf)}>click-leaf</button>
        <button onClick={() => props.onSelect(band)}>click-band</button>
        <button onClick={() => props.onSelect(ghost)}>click-ghost</button>
      </div>
    )
  },
}))

const band = makeBand({ id: 'top-100', label: 'Топ-100', known: 42, total: 100 })

async function scene() {
  return waitFor(() => screen.getByTestId('scene'))
}

describe('<GardenTree>', () => {
  it('монтирует сцену и показывает тултип блока при наведении на гроздь', async () => {
    const { container } = renderWithProviders(<GardenTree bands={[band]} byId={{}} />)
    expect(container.querySelector('.garden-tree')).toBeTruthy()
    await scene()
    await userEvent.click(screen.getByText('hover-band'))
    expect(screen.getByText('Топ-100')).toBeInTheDocument()
    expect(screen.getByText('42 / 100 освоено')).toBeInTheDocument()
    await userEvent.click(screen.getByText('leave'))
    expect(screen.queryByText('Топ-100')).not.toBeInTheDocument()
  })

  it('лист = слово: наведение подгружает слова блока, клик открывает карточку', async () => {
    const onSelectWord = vi.fn()
    const loadBandWords = vi
      .fn()
      .mockResolvedValue([makeWordLeaf({ id: 'en:go', lemma: 'go', status: 'KNOWN' })])
    renderWithProviders(
      <GardenTree
        bands={[band]}
        byId={{}}
        onSelectWord={onSelectWord}
        loadBandWords={loadBandWords}
      />,
    )
    await scene()
    await userEvent.click(screen.getByText('hover-leaf'))
    await waitFor(() =>
      expect(loadBandWords).toHaveBeenCalledWith('top-100', CLUSTER_CAPACITY[0]),
    )
    // слова пришли — повторное наведение показывает лемму и статус
    await userEvent.click(screen.getByText('hover-leaf'))
    expect(await screen.findByText('go')).toBeInTheDocument()
    expect(screen.getByText('Знаю')).toBeInTheDocument()
    // повторное наведение не перезапрашивает
    expect(loadBandWords).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByText('click-leaf'))
    expect(onSelectWord).toHaveBeenCalledWith('en:go')
  })

  it('клик по грозди уводит в блок; пока слова не загружены, клик по листу — тоже', async () => {
    const onSelectBand = vi.fn()
    const onSelectWord = vi.fn()
    renderWithProviders(
      <GardenTree bands={[band]} byId={{}} onSelectBand={onSelectBand} onSelectWord={onSelectWord} />,
    )
    await scene()
    await userEvent.click(screen.getByText('click-band'))
    expect(onSelectBand).toHaveBeenCalledWith('top-100')
    await userEvent.click(screen.getByText('click-leaf'))
    // без loadBandWords слово неизвестно — уходим в блок
    expect(onSelectBand).toHaveBeenCalledTimes(2)
    expect(onSelectWord).not.toHaveBeenCalled()
  })

  it('гроздь без блока: ни тултипа, ни навигации', async () => {
    const onSelectBand = vi.fn()
    renderWithProviders(<GardenTree bands={[band]} byId={{}} onSelectBand={onSelectBand} />)
    await scene()
    await userEvent.click(screen.getByText('hover-ghost'))
    expect(screen.queryByText('Топ-100')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('click-ghost'))
    expect(onSelectBand).not.toHaveBeenCalled()
  })

  it('сцена упала (нет WebGL) — сад молча уступает место странице', async () => {
    const silent = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = renderWithProviders(
      <GardenTree bands={[makeBand({ id: 'boom' })]} byId={{}} />,
    )
    await waitFor(() => expect(container.querySelector('.garden-tree')).toBeTruthy())
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument()
    silent.mockRestore()
  })
})
