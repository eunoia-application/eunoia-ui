import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// PixiJS требует WebGL-канвас, которого нет в jsdom. Для тестов заглушаем
// движок безобидными no-op двойниками — сам рендер дерева проверяется вживую.
vi.mock('pixi.js', () => {
  class Graphics {
    position = { set: () => {} }
    scale = { set: () => {} }
    filters: unknown[] = []
    tint = 0
    alpha = 1
    rotation = 0
    blendMode = ''
    visible = true
    clear() {
      return this
    }
    moveTo() {
      return this
    }
    lineTo() {
      return this
    }
    bezierCurveTo() {
      return this
    }
    quadraticCurveTo() {
      return this
    }
    closePath() {
      return this
    }
    ellipse() {
      return this
    }
    fill() {
      return this
    }
    stroke() {
      return this
    }
  }
  class Container {
    scale = { set: () => {} }
    position = { set: () => {} }
    pivot = { set: () => {} }
    rotation = 0
    alpha = 1
    visible = true
    addChild() {}
  }
  class Application {
    stage = new Container()
    ticker = { add: () => {}, remove: () => {} }
    canvas = document.createElement('canvas')
    async init() {}
    destroy() {}
  }
  class BlurFilter {}
  return { Application, Container, Graphics, BlurFilter }
})

afterEach(() => {
  cleanup()
})

// jsdom не реализует matchMedia (antd Grid / useMediaQuery) и ResizeObserver
// (antd вычисляет размеры). В тестах достаточно безопасных no-op заглушек.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

if (typeof window.ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
}
