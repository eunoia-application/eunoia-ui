import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMasteryStore } from '@entities/mastery'
import { renderWithProviders } from '@shared/test/render'

import { MasteryControl } from './MasteryControl'

afterEach(() => useMasteryStore.getState().reset())

describe('<MasteryControl>', () => {
  it('клик по статусу отправляет отметку', async () => {
    const setStatus = vi.fn().mockResolvedValue(undefined)
    useMasteryStore.setState({ setStatus })

    renderWithProviders(<MasteryControl lexemeId="en:go:VERB" status="UNKNOWN" />)
    await userEvent.click(screen.getByText('Знаю'))

    expect(setStatus).toHaveBeenCalledWith('en:go:VERB', 'KNOWN')
  })

  it('ошибку сохранения глушит — тост уже показал стор', async () => {
    const setStatus = vi.fn().mockRejectedValue(new Error('boom'))
    useMasteryStore.setState({ setStatus })

    renderWithProviders(<MasteryControl lexemeId="en:go:VERB" status="KNOWN" />)
    await userEvent.click(screen.getByText('Учу'))

    expect(setStatus).toHaveBeenCalledWith('en:go:VERB', 'LEARNING')
  })
})
