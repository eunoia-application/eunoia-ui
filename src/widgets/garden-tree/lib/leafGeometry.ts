import { Shape, ShapeGeometry, type BufferGeometry } from 'three'

/** Доля черешка в общей длине листа — им лист крепится к коре. */
export const PETIOLE_FRACTION = 0.12

/**
 * Процедурный лист: черешок + пластина кривыми Безье (по мотивам 2D-сада)
 * с лёгким продольным изгибом, чтобы ловить свет. Базовая точка черешка
 * в (0,0), рост вдоль +Y, полная длина 1 — мировой размер задаёт инстанс.
 */
export function buildLeafGeometry(curvature = 0.2): BufferGeometry {
  const s = new Shape()
  // Черешок: узкий стебелёк, которым лист держится за ветку.
  s.moveTo(0.012, -0.14)
  s.lineTo(0.03, -0.01)
  // Пластина: правая половина вверх до кончика, левая — вниз.
  s.bezierCurveTo(0.36, 0.14, 0.4, 0.52, 0.2, 0.78)
  s.bezierCurveTo(0.1, 0.9, 0, 1, 0, 1)
  s.bezierCurveTo(-0.1, 0.9, -0.2, 0.78, -0.2, 0.78)
  s.bezierCurveTo(-0.4, 0.52, -0.36, 0.14, -0.03, -0.01)
  s.lineTo(-0.012, -0.14)
  s.closePath()

  const geometry = new ShapeGeometry(s, 10)
  // База черешка в начало координат, полная длина нормируется к 1.
  geometry.translate(0, 0.14, 0)
  geometry.scale(1 / 1.14, 1 / 1.14, 1)

  // Продольный изгиб и поперечный прогиб «лодочкой» — объём вместо спрайта.
  const pos = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < pos.count; i += 1) {
    const y = pos.getY(i)
    const x = pos.getX(i)
    pos.setZ(i, Math.sin(y * Math.PI) * curvature - Math.abs(x) * curvature * 1.1)
    // UV по габаритам листа — для процедурной текстуры жилок.
    uv.setXY(i, x / 0.72 + 0.5, y)
  }
  geometry.computeVertexNormals()
  return geometry
}
