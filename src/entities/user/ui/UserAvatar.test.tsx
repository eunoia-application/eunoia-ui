import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { UserAvatar } from './UserAvatar'

describe('<UserAvatar>', () => {
  it('avatarUrl → изображение', () => {
    const { container } = render(
      <UserAvatar user={{ username: 'u', email: 'e@x', avatarUrl: 'http://x/a.png' }} />,
    )
    expect(container.querySelector('img')).toBeTruthy()
  })

  it('без avatarUrl → инициалы', () => {
    render(
      <UserAvatar
        user={{ firstName: 'Alex', lastName: 'Johnson', username: 'u', email: 'e@x' }}
      />,
    )
    expect(screen.getByText('AJ')).toBeInTheDocument()
  })

  it('null → «?»', () => {
    render(<UserAvatar user={null} />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
