import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as RouterDom from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMasteryStore } from '@entities/mastery'
import { useWordStore } from '@entities/word'
import { makeWordCard, makeWordLeaf } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { StudyPage } from './StudyPage'

const navigate = vi.fn()

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof RouterDom>()
  return { ...actual, useNavigate: () => navigate }
})

afterEach(() => {
  useMasteryStore.getState().reset()
  useWordStore.getState().clearCard()
  navigate.mockReset()
})

describe('<StudyPage>', () => {
  it('грузит очередь и мой прогресс', () => {
    const fetchStudy = vi.fn()
    const fetchMine = vi.fn()
    useMasteryStore.setState({ fetchStudy, fetchMine })

    renderWithProviders(<StudyPage />)

    expect(screen.getByText('Учить')).toBeInTheDocument()
    expect(fetchStudy).toHaveBeenCalled()
    expect(fetchMine).toHaveBeenCalled()
  })

  it('loading без очереди → скелет', () => {
    useMasteryStore.setState({
      fetchStudy: vi.fn(),
      fetchMine: vi.fn(),
      study: [],
      studyStatus: 'loading',
    })
    const { container } = renderWithProviders(<StudyPage />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('пустая очередь → зовёт в раздел слов', async () => {
    useMasteryStore.setState({
      fetchStudy: vi.fn(),
      fetchMine: vi.fn(),
      study: [],
      studyStatus: 'success',
    })

    renderWithProviders(<StudyPage />)
    expect(screen.getByText('Очередь пуста')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Перейти к словам' }))
    expect(navigate).toHaveBeenCalledWith('/words')
  })

  it('ошибка → «Повторить» перезагружает', async () => {
    const fetchStudy = vi.fn()
    useMasteryStore.setState({
      fetchStudy,
      fetchMine: vi.fn(),
      study: [],
      studyStatus: 'error',
      studyError: { status: 500, code: 'x', message: 'm' },
    })

    renderWithProviders(<StudyPage />)
    fetchStudy.mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchStudy).toHaveBeenCalled()
  })

  it('слова очереди карточками, клик открывает карточку', async () => {
    useMasteryStore.setState({
      fetchStudy: vi.fn(),
      fetchMine: vi.fn(),
      study: [makeWordLeaf({ status: 'LEARNING' })],
      studyStatus: 'success',
    })
    useWordStore.setState({
      card: makeWordCard(),
      cardStatus: 'success',
      fetchCard: vi.fn(),
      clearCard: vi.fn(),
    })

    renderWithProviders(<StudyPage />)
    expect(screen.getByText('go')).toBeInTheDocument()

    await userEvent.click(screen.getByText('go'))
    expect(await screen.findByText('Мой статус')).toBeInTheDocument()

    await userEvent.click(document.querySelector('.ant-modal-close') as HTMLElement)
    await waitFor(() => expect(screen.queryByText('Мой статус')).not.toBeInTheDocument())
  })
})
