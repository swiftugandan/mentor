import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import {
  studentRegistrationSchema,
  alumniRegistrationSchema,
} from '@/lib/validations/auth'
import type { StudentRegistrationForm, AlumniRegistrationForm } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validatedFields =
      body.role === UserRole.STUDENT
        ? studentRegistrationSchema.safeParse(body)
        : alumniRegistrationSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: 'Invalid fields',
          details: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email, password, name, role } = validatedFields.data

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    })

    if (role === UserRole.STUDENT) {
      const studentData = validatedFields.data as StudentRegistrationForm
      const { gradeLevel, schoolName, interests, bio } = studentData
      await db.studentProfile.create({
        data: {
          gradeLevel,
          schoolName,
          interests,
          bio,
          userId: user.id,
        },
      })
    } else if (role === UserRole.ALUMNI) {
      const alumniData = validatedFields.data as AlumniRegistrationForm
      const { profession, company, graduationYear, expertise, bio } = alumniData
      await db.alumniProfile.create({
        data: {
          profession,
          company,
          graduationYear,
          expertise,
          bio,
          userId: user.id,
        },
      })
    }

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
