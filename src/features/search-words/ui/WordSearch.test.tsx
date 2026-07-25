import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { wordApi } from '@entities/word'
import type * as WordEntity from '@entities/word'
import { makeWordRef } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { WordSearch } from './WordSearch'

vi.mock('@entities/word', async (orig) => {
  const actual = await orig<typeof WordEntity>()
  return { ...actual, wordApi: { ...actual.wordApi, search: vi.fn() } }
})

const search = wordApi.search as unknown as ReturnType<typeof vi.fn>

afterEach(() => search.mockReset())

describe('<WordSearch>', () => {
  it('после паузы ищет и отдаёт id выбранного слова', async () => {
    search.mockResolvedValue([
      makeWordRef({ lemma: 'go' }),
      makeWordRef({ id: 'en:raw', lemma: 'raw', pos: undefined }),
    ])
    const onPick = vi.fn()

    renderWithProviders(<WordSearch onPick={onPick} />)
    await userEvent.type(screen.getByPlaceholderText('Найти слово'), 'go')

    await waitFor(() => expect(search).toHaveBeenCalledWith('go', 10), { timeout: 2000 })
    await waitFor(() => expect(screen.getByText('go · глаг.')).toBeInTheDocument())

    await userEvent.click(screen.getByText('go · глаг.'))
    expect(onPick).toHaveBeenCalledWith('en:go')
  })

  it('пустой запрос поиск не дёргает', async () => {
    renderWithProviders(<WordSearch onPick={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Найти слово'), '   ')
    await new Promise((resolve) => setTimeout(resolve, 600))
    expect(search).not.toHaveBeenCalled()
  })

  it('ошибка поиска не роняет — список пуст', async () => {
    search.mockRejectedValue(new Error('boom'))
    renderWithProviders(<WordSearch onPick={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Найти слово'), 'go')
    await waitFor(() => expect(search).toHaveBeenCalled(), { timeout: 2000 })
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })
})
