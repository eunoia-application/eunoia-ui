import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { MathUtils, Vector3 } from 'three'

import { dimsFromProgress } from '../../model/growth'

interface Props {
  /** Анимируемый прогресс роста — камера отъезжает по мере взросления дерева. */
  anim: RefObject<{ p: number; branches: number }>
  calm: boolean
}

/**
 * Камера живёт, но незаметно: медленный орбитальный дрейф, дыхание по высоте
 * и лёгкий параллакс за указателем. Все движения демпфированы.
 */
export function CameraRig({ anim, calm }: Props) {
  const { camera, pointer } = useThree()
  const look = useRef(new Vector3(0, 0.6, 0))
  const par = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const amp = calm ? 0.25 : 1
    const { height } = dimsFromProgress(anim.current.p, anim.current.branches)

    // Кадрирование: дерево занимает ~половину кадра на любой стадии роста.
    const dist = Math.max(0.95, height * 2.35)
    const lookY = height * 0.52

    par.current.x = MathUtils.damp(par.current.x, pointer.x * 0.1 * amp, 2.2, dt)
    par.current.y = MathUtils.damp(par.current.y, pointer.y * 0.05 * amp, 2.2, dt)

    const az = Math.sin(t * 0.05) * 0.06 * amp + par.current.x
    const y = lookY + height * 0.1 + Math.sin(t * 0.5) * 0.018 * amp - par.current.y

    camera.position.x = MathUtils.damp(camera.position.x, Math.sin(az) * dist, 2.5, dt)
    camera.position.y = MathUtils.damp(camera.position.y, y, 2.5, dt)
    camera.position.z = MathUtils.damp(camera.position.z, Math.cos(az) * dist, 2.5, dt)

    look.current.y = MathUtils.damp(look.current.y, lookY, 2.5, dt)
    camera.lookAt(look.current)
  })

  return null
}
