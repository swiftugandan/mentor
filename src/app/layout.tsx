import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

import { AuthProvider } from '@/components/providers/auth-provider'
import { QueryProvider } from '@/components/providers/query-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alumni Mentorship Platform',
  description:
    'Connect high school students with professional alumni for mentorship',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col`}>
        <QueryProvider>
          <AuthProvider>
            <div className="flex flex-col flex-grow">
              {children}
              <Toaster />
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
