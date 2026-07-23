import { App } from 'antd'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { notify } from '@shared/lib'

import { NotifyBridge } from './NotifyBridge'

describe('<NotifyBridge>', () => {
  it('привязывает notify внутри App', () => {
    render(
      <App>
        <NotifyBridge />
      </App>,
    )
    expect(() => notify.success('ok')).not.toThrow()
  })
})
