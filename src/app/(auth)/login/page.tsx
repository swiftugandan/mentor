'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

import { AuthForm } from '@/components/forms/auth-form'
import { AuthHeader } from '@/components/auth-header'
import type { AuthForm as IAuthForm } from '@/types'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  const onSubmit = async (data: IAuthForm) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid credentials')
        return
      }

      router.push(from)
      router.refresh()
    } catch (error: unknown) {
      console.error('Login error:', error)
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in to your account
        </p>
      </div>
      <AuthForm type="login" onSubmit={onSubmit} />
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/register"
          className="hover:text-brand underline underline-offset-4"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <>
      <AuthHeader />
      <main className="container relative flex min-h-screen flex-col items-center justify-center px-4">
        <Suspense
          fallback={
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </main>
    </>
  )
}
