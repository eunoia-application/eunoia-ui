import { Canvas, type RootState } from '@react-three/fiber'
import { useCallback, useState } from 'react'

import { GardenScene } from './GardenScene'
import type { SceneProps } from './types'

/**
 * WebGL-холст сада (React Three Fiber). Прозрачный фон — дерево живёт прямо
 * на странице в обеих темах; dpr ограничен 2 ради слабых ноутбуков.
 * Потерю WebGL-контекста (браузер эвакуирует GPU-ресурсы) переживаем
 * пересозданием холста — сад отрастает заново, а не замирает навсегда.
 */
export default function GardenCanvas(props: SceneProps) {
  const [glKey, setGlKey] = useState(0)

  const handleCreated = useCallback((state: RootState) => {
    state.gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      setTimeout(() => setGlKey((k) => k + 1), 250)
    })
  }, [])

  return (
    <Canvas
      key={glKey}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 34, near: 0.1, far: 60, position: [0, 1.4, 4.6] }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={handleCreated}
    >
      <GardenScene {...props} />
    </Canvas>
  )
}
