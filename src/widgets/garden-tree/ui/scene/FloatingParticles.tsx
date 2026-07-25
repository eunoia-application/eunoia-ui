import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide, Euler, Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three'

import { buildLeafGeometry } from '../../lib/leafGeometry'
import { hash01 } from '../../lib/math'
import { LEAF_MID, hexToRgb } from '../../lib/palette'

interface Props {
  dark: boolean
  /** 0..1 — интенсивность жизни вокруг дерева. */
  life: number
  calm: boolean
  crownY: number
  crownR: number
}

const FALLING = 7

const tmpM = new Matrix4()
const tmpQ = new Quaternion()
const tmpE = new Euler()
const tmpP = new Vector3()
const tmpS = new Vector3()

/** Пыльца в утреннем свете (светлая тема) и редкие опадающие листья. */
export function FloatingParticles({ dark, life, calm, crownY, crownR }: Props) {
  const leavesRef = useRef<InstancedMesh>(null)
  const geo = useMemo(() => buildLeafGeometry(), [])
  useEffect(() => () => geo.dispose(), [geo])

  // Падающие листья: медленное кружение от кроны к земле, respawn наверху.
  const drops = useRef(
    Array.from({ length: FALLING }, (_, i) => ({
      x: 0,
      y: -1 - hash01(i, 1) * 2,
      z: 0,
      vy: 0.09 + hash01(i, 2) * 0.08,
      drift: hash01(i, 3) * Math.PI * 2,
      spin: (hash01(i, 4) - 0.5) * 1.4,
    })),
  )

  const leafRgb = hexToRgb(LEAF_MID)

  useFrame((state, dt) => {
    const mesh = leavesRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const speed = calm ? 0.3 : 1
    const active = Math.round(FALLING * Math.min(1, life * 1.4))
    for (let i = 0; i < FALLING; i += 1) {
      const d = drops.current[i]
      if (i >= active) {
        tmpM.makeScale(0, 0, 0)
        mesh.setMatrixAt(i, tmpM)
        continue
      }
      d.y -= d.vy * dt * speed
      if (d.y < 0.04) {
        d.y = crownY + crownR * (0.4 + hash01(i, t) * 0.5)
        d.x = (hash01(i, t, 5) - 0.5) * crownR * 2.2
        d.z = (hash01(i, t, 6) - 0.5) * crownR * 1.6
      }
      const x = d.x + Math.sin(t * 0.7 + d.drift) * 0.16
      const z = d.z + Math.cos(t * 0.5 + d.drift) * 0.1
      tmpQ.setFromEuler(tmpE.set(t * d.spin, d.drift + t * 0.4, Math.sin(t + d.drift) * 0.6))
      mesh.setMatrixAt(i, tmpM.compose(tmpP.set(x, d.y, z), tmpQ, tmpS.setScalar(0.05)))
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {!dark && life > 0.02 ? (
        <Sparkles
          count={Math.round(8 + life * 18)}
          color="#f5efd8"
          size={1.4 + life * 1.4}
          opacity={0.4}
          speed={calm ? 0.05 : 0.16}
          noise={0.5}
          position={[0, crownY * 0.85, 0.3]}
          scale={[crownR * 3.6, crownY * 1.7, crownR * 2.6]}
        />
      ) : null}
      <instancedMesh ref={leavesRef} args={[geo, undefined, FALLING]} frustumCulled={false}>
        <meshStandardMaterial
          side={DoubleSide}
          roughness={0.6}
          color={[leafRgb.r, leafRgb.g, leafRgb.b]}
          transparent
          opacity={0.85}
        />
      </instancedMesh>
    </group>
  )
}
