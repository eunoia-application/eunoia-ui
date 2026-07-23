import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Минимум 3 символа')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Латиница, цифры, «-» и «_»'),
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  firstName: z.string().trim().optional(),
})

export type RegisterValues = z.infer<typeof registerSchema>
