import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { lexemeApi } from '@entities/lexeme'
import type * as LexemeEntity from '@entities/lexeme'
import { makeLexemeRef } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { LexemeSearch } from './LexemeSearch'

vi.mock('@entities/lexeme', async (orig) => {
  const actual = await orig<typeof LexemeEntity>()
  return { ...actual, lexemeApi: { ...actual.lexemeApi, search: vi.fn() } }
})

const search = lexemeApi.search as unknown as ReturnType<typeof vi.fn>

afterEach(() => search.mockReset())

describe('<LexemeSearch>', () => {
  it('после паузы ищет и отдаёт id выбранного слова', async () => {
    search.mockResolvedValue([makeLexemeRef({ lemma: 'go' })])
    const onPick = vi.fn()

    renderWithProviders(<LexemeSearch onPick={onPick} />)
    await userEvent.type(screen.getByPlaceholderText('Найти слово'), 'go')

    await waitFor(() => expect(search).toHaveBeenCalledWith('go', 10), { timeout: 2000 })
    await waitFor(() => expect(screen.getByText('go')).toBeInTheDocument())

    await userEvent.click(screen.getByText('go'))
    expect(onPick).toHaveBeenCalledWith('en:go:VERB')
  })

  it('пустой запрос поиск не дёргает', async () => {
    renderWithProviders(<LexemeSearch onPick={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Найти слово'), '   ')

    await new Promise((resolve) => setTimeout(resolve, 600))
    expect(search).not.toHaveBeenCalled()
  })

  it('ошибка поиска не роняет — список просто пустой', async () => {
    search.mockRejectedValue(new Error('boom'))

    renderWithProviders(<LexemeSearch onPick={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Найти слово'), 'go')

    await waitFor(() => expect(search).toHaveBeenCalled(), { timeout: 2000 })
    // Подсказок нет: AntD держит введённый текст в скрытом aria-live, поэтому
    // проверяем именно отсутствие опций дропдауна.
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })
})
