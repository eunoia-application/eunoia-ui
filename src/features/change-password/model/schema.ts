import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z.string().min(8, 'Минимум 8 символов'),
    confirm: z.string(),
  })
  .refine((data) => data.newPassword === data.confirm, {
    path: ['confirm'],
    message: 'Пароли не совпадают',
  })

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
