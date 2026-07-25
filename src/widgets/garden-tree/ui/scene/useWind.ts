import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import type { Material, Vector3 } from 'three'

import { clamp01 } from '../../lib/math'
import { fbm1 } from '../../lib/noise'

/**
 * WindController: единый «ветер» сцены — время и сила порывов (фрактальный шум,
 * без видимой периодики). Одна и та же формула смещения гнёт ствол и ветви в
 * вершинном шейдере и двигает точки крепления листьев на CPU — крона не
 * отрывается от качающегося дерева.
 */

export interface WindUniforms {
  uTime: { value: number }
  uWind: { value: number }
}

/** Коэффициенты качания — общие для шейдера и CPU-расчёта листьев. */
const F1 = 1.05
const F1Y = 0.8
const F2 = 0.47
const F2P = 1.7
const F3 = 0.83
const F3Y = 0.5

/** @param strength 0..1 — жёсткость дерева: росток почти не гнётся, крона дышит. */
export function useWind(calm: boolean, strength = 1): WindUniforms {
  const uniforms = useMemo<WindUniforms>(() => ({ uTime: { value: 0 }, uWind: { value: 0 } }), [])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t
    uniforms.uWind.value =
      (calm ? 0.25 : 1) * strength * (0.55 + 0.45 * fbm1(t * 0.11)) * 0.05
  })
  return uniforms
}

/**
 * Смещение ветра в точке на высоте y (нормировка по maxY — той же, что aH
 * в геометрии трубок). Ровно та формула, что вшита в шейдер applyWind.
 */
export function windOffsetAt(
  y: number,
  maxY: number,
  wind: WindUniforms,
  out: Vector3,
): Vector3 {
  const t = wind.uTime.value
  const aH = clamp01(y / Math.max(1e-3, maxY))
  const sway = aH * aH * wind.uWind.value
  out.x = (Math.sin(t * F1 + y * F1Y) * 0.6 + Math.sin(t * F2 + F2P) * 0.4) * sway
  out.y = 0
  out.z = Math.cos(t * F3 + y * F3Y) * sway * 0.7
  return out
}

/**
 * Вплетает покачивание в стандартный материал: смещение вершин растёт с высотой
 * (aH из геометрии трубок) — корни неподвижны, вершина дышит на ветру.
 */
export function applyWind(material: Material, wind: WindUniforms) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = wind.uTime
    shader.uniforms.uWind = wind.uWind
    shader.vertexShader = `
      attribute float aH;
      uniform float uTime;
      uniform float uWind;
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float sway = aH * aH * uWind;
      transformed.x += (sin(uTime * ${F1} + transformed.y * ${F1Y}) * 0.6 + sin(uTime * ${F2} + ${F2P}) * 0.4) * sway;
      transformed.z += cos(uTime * ${F3} + transformed.y * ${F3Y}) * sway * 0.7;`,
    )
  }
  material.customProgramCacheKey = () => 'garden-wind'
}
