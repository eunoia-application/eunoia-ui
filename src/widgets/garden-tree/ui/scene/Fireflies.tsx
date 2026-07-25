import { Sparkles } from '@react-three/drei'

interface Props {
  dark: boolean
  /** 0..1 — чем больше знаний, тем больше жизни вокруг дерева. */
  life: number
  calm: boolean
  crownY: number
  crownR: number
}

/** Светлячки тёплого вечера — только тёмная тема, количество растёт с прогрессом. */
export function Fireflies({ dark, life, calm, crownY, crownR }: Props) {
  if (!dark || life <= 0.02) return null
  return (
    <Sparkles
      count={Math.round(6 + life * 22)}
      color="#ffd98c"
      size={2 + life * 2.4}
      opacity={0.6}
      speed={calm ? 0.08 : 0.3}
      noise={0.8}
      position={[0, crownY * 0.9, 0]}
      scale={[crownR * 3.4, crownY * 1.6, crownR * 3]}
    />
  )
}
