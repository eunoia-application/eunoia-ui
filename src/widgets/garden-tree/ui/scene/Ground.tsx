import { getRadialTexture } from './textures'

interface Props {
  dark: boolean
  /** Радиус кроны — тень масштабируется с деревом. */
  crownR: number
}

/**
 * Земля — только компактная контактная тень под деревом: холст прозрачный,
 * дерево живёт прямо на странице, без подложек и «рамок».
 */
export function Ground({ dark, crownR }: Props) {
  const shadow = getRadialTexture('#000000')
  if (!shadow) return null
  const r = Math.max(0.24, crownR * 0.55)
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
      <circleGeometry args={[r, 40]} />
      <meshBasicMaterial map={shadow} transparent opacity={dark ? 0.3 : 0.15} depthWrite={false} />
    </mesh>
  )
}
