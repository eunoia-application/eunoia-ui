import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMasteryStore } from '@entities/mastery'
import { renderWithProviders } from '@shared/test/render'

import { MasteryControl } from './MasteryControl'

afterEach(() => useMasteryStore.getState().reset())

describe('<MasteryControl>', () => {
  it('клик «Знаю» отправляет KNOWN', async () => {
    const setStatus = vi.fn().mockResolvedValue(undefined)
    useMasteryStore.setState({ setStatus })

    renderWithProviders(<MasteryControl wordId="en:go" status="UNKNOWN" />)
    await userEvent.click(screen.getByText('Знаю'))

    expect(setStatus).toHaveBeenCalledWith('en:go', 'KNOWN')
  })

  it('повтор по активной кнопке снимает отметку (UNKNOWN)', async () => {
    const setStatus = vi.fn().mockResolvedValue(undefined)
    useMasteryStore.setState({ setStatus })

    renderWithProviders(<MasteryControl wordId="en:go" status="LEARNING" />)
    await userEvent.click(screen.getByText('Учить'))

    expect(setStatus).toHaveBeenCalledWith('en:go', 'UNKNOWN')
  })

  it('ошибку сохранения глушит — тост уже показал стор', async () => {
    const setStatus = vi.fn().mockRejectedValue(new Error('boom'))
    useMasteryStore.setState({ setStatus })

    renderWithProviders(<MasteryControl wordId="en:go" status="UNKNOWN" />)
    await userEvent.click(screen.getByText('Учить'))

    expect(setStatus).toHaveBeenCalledWith('en:go', 'LEARNING')
  })
})
