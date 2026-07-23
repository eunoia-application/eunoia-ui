import { z } from 'zod'

export const updateProfileSchema = z.object({
  firstName: z.string().trim().max(60, 'До 60 символов').optional(),
  lastName: z.string().trim().max(60, 'До 60 символов').optional(),
  bio: z.string().trim().max(280, 'До 280 символов').optional(),
})

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>
