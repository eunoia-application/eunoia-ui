import { BufferAttribute, BufferGeometry, Quaternion, Vector3 } from 'three'

import { TAU } from './math'

/**
 * Сужающиеся трубки по осевым линиям (parallel transport frame) — ствол и
 * ветви одним мешем: минимум draw calls, честная геометрия вместо картинок.
 * UV.y идёт вдоль ветви (для текстуры коры), атрибут aH — нормированная
 * высота вершины (для ветра в вершинном шейдере).
 */

export interface TubePath {
  points: Vector3[]
  radii: number[]
}

export function buildTubeGeometry(paths: TubePath[], radialSegments = 8, maxY = 1): BufferGeometry {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const heights: number[] = []
  const indices: number[] = []

  const tangent = new Vector3()
  const prevTangent = new Vector3()
  const normal = new Vector3()
  const binormal = new Vector3()
  const rot = new Quaternion()
  const dir = new Vector3()

  for (const path of paths) {
    const n = path.points.length
    if (n < 2) continue
    const ringStart = positions.length / 3

    for (let i = 0; i < n; i += 1) {
      const prev = path.points[Math.max(0, i - 1)]
      const next = path.points[Math.min(n - 1, i + 1)]
      tangent.subVectors(next, prev).normalize()

      if (i === 0) {
        // Первый нормаль — любой перпендикуляр к касательной.
        const axis = Math.abs(tangent.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
        normal.crossVectors(tangent, axis).normalize()
      } else {
        // Переносим frame без кручения: доворот на угол между касательными.
        rot.setFromUnitVectors(prevTangent, tangent)
        normal.applyQuaternion(rot).normalize()
      }
      prevTangent.copy(tangent)
      binormal.crossVectors(tangent, normal).normalize()

      const center = path.points[i]
      const r = path.radii[i]
      for (let s = 0; s <= radialSegments; s += 1) {
        const a = (s / radialSegments) * TAU
        dir
          .copy(normal)
          .multiplyScalar(Math.cos(a))
          .addScaledVector(binormal, Math.sin(a))
        positions.push(center.x + dir.x * r, center.y + dir.y * r, center.z + dir.z * r)
        normals.push(dir.x, dir.y, dir.z)
        uvs.push(s / radialSegments, i / (n - 1))
        heights.push(Math.min(1, Math.max(0, (center.y + dir.y * r) / maxY)))
      }
    }

    const ringSize = radialSegments + 1
    for (let i = 0; i < n - 1; i += 1) {
      for (let s = 0; s < radialSegments; s += 1) {
        const a = ringStart + i * ringSize + s
        const b = a + ringSize
        indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.setAttribute('aH', new BufferAttribute(new Float32Array(heights), 1))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  return geometry
}
