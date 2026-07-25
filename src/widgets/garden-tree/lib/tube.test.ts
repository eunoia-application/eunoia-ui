import { Vector3 } from 'three'
import { describe, expect, it } from 'vitest'

import { buildTubeGeometry, type TubePath } from './tube'

const straight: TubePath = {
  points: [new Vector3(0, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 2, 0)],
  radii: [0.2, 0.1, 0.05],
}

describe('buildTubeGeometry', () => {
  it('строит кольца по осевой линии с нужными атрибутами', () => {
    const radial = 8
    const geo = buildTubeGeometry([straight], radial, 2)
    const pos = geo.getAttribute('position')
    expect(pos.count).toBe(straight.points.length * (radial + 1))
    expect(geo.getAttribute('normal').count).toBe(pos.count)
    expect(geo.getAttribute('uv').count).toBe(pos.count)
    expect(geo.getAttribute('aH').count).toBe(pos.count)
    expect(geo.getIndex()?.count).toBe((straight.points.length - 1) * radial * 6)
  })

  it('вершины лежат на радиусе своего кольца, aH нормирован', () => {
    const geo = buildTubeGeometry([straight], 8, 2)
    const pos = geo.getAttribute('position')
    const aH = geo.getAttribute('aH')
    // первое кольцо: y = 0, расстояние от оси = radii[0]
    for (let s = 0; s < 9; s += 1) {
      const r = Math.hypot(pos.getX(s), pos.getZ(s))
      expect(r).toBeCloseTo(0.2, 5)
      expect(pos.getY(s)).toBeCloseTo(0, 5)
    }
    for (let i = 0; i < aH.count; i += 1) {
      expect(aH.getX(i)).toBeGreaterThanOrEqual(0)
      expect(aH.getX(i)).toBeLessThanOrEqual(1)
    }
  })

  it('объединяет несколько путей в один меш и пропускает вырожденные', () => {
    const two = buildTubeGeometry([straight, straight], 6, 2)
    expect(two.getAttribute('position').count).toBe(2 * straight.points.length * 7)
    const skipped = buildTubeGeometry(
      [{ points: [new Vector3()], radii: [0.1] }, straight],
      6,
      2,
    )
    expect(skipped.getAttribute('position').count).toBe(straight.points.length * 7)
  })

  it('нет NaN в позициях (кривые пути с параллельным переносом)', () => {
    const curved: TubePath = {
      points: [
        new Vector3(0, 0, 0),
        new Vector3(0.2, 0.5, 0.1),
        new Vector3(0.5, 0.9, 0.4),
        new Vector3(0.9, 1.1, 0.8),
      ],
      radii: [0.1, 0.07, 0.04, 0.01],
    }
    const geo = buildTubeGeometry([curved], 7, 1.2)
    const pos = geo.getAttribute('position')
    for (let i = 0; i < pos.count; i += 1) {
      expect(Number.isFinite(pos.getX(i) + pos.getY(i) + pos.getZ(i))).toBe(true)
    }
  })
})
