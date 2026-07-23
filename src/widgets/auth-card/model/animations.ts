import type { Transition, Variants } from 'framer-motion'

/** Плавность из оригинала (material-подобная кривая). */
export const spring: Transition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
}

export const signInVariants: Variants = {
  active: { x: '0%', opacity: 1, zIndex: 5 },
  hidden: { x: '100%', opacity: 0, zIndex: 1 },
}

export const signUpVariants: Variants = {
  active: { x: '0%', opacity: 1, zIndex: 5 },
  hidden: { x: '-100%', opacity: 0, zIndex: 1 },
}

export const overlayVariants: Variants = {
  signIn: { x: '0%' },
  signUp: { x: '-100%' },
}
