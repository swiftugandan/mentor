'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

import { AuthForm } from '@/components/forms/auth-form'
import { AuthHeader } from '@/components/auth-header'
import type { AuthForm as IAuthForm } from '@/types'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  const onSubmit = async (data: IAuthForm) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to register')
      }

      toast.success('Registration successful')
      router.push(`/login?from=${encodeURIComponent(from)}`)
    } catch (error: unknown) {
      console.error('Registration error:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Something went wrong')
      }
    }
  }

  return (
    <>
      <AuthHeader />
      <main className="container relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <AuthForm type="register" onSubmit={onSubmit} />
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-brand underline underline-offset-4"
            >
              Already have an account? Sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
