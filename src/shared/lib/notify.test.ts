import { describe, expect, it, vi } from 'vitest'

import { bindNotify, notify } from './notify'

describe('notify', () => {
  it('до bind — no-op, не бросает', () => {
    expect(() => {
      notify.success('s')
      notify.error('e')
      notify.info('i')
      notify.warning('w')
      notify.toast('t')
    }).not.toThrow()
  })

  it('после bind проксирует в antd notification/message', () => {
    const notification = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    }
    const message = { open: vi.fn() }
    bindNotify({ notification, message } as any)

    notify.success('S', 'ds')
    notify.error('E')
    notify.info('I')
    notify.warning('W')
    notify.toast('T')

    expect(notification.success).toHaveBeenCalledWith({ message: 'S', description: 'ds' })
    expect(notification.error).toHaveBeenCalledWith({ message: 'E', description: undefined })
    expect(notification.info).toHaveBeenCalledWith({ message: 'I', description: undefined })
    expect(notification.warning).toHaveBeenCalledWith({ message: 'W', description: undefined })
    expect(message.open).toHaveBeenCalledWith({ type: 'success', content: 'T' })
  })
})
