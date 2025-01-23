import { z } from 'zod'
import { UserRole } from '@prisma/client'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole),
})

export const studentProfileSchema = z.object({
  gradeLevel: z.number().min(9).max(12),
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  bio: z.string().optional(),
})

export const alumniProfileSchema = z.object({
  profession: z.string().min(2, 'Profession must be at least 2 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  graduationYear: z.number().min(1900).max(new Date().getFullYear()),
  expertise: z
    .array(z.string())
    .min(1, 'Select at least one area of expertise'),
  bio: z.string().optional(),
})

export const studentRegistrationSchema =
  registerSchema.merge(studentProfileSchema)
export const alumniRegistrationSchema =
  registerSchema.merge(alumniProfileSchema)
