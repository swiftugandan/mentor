'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import { GraduationCap, LogOut } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <GraduationCap className="h-8 w-8 text-primary" />
      </div>
      <span className="text-xl font-bold">
        Alumni<span className="text-primary">Mentor</span>
      </span>
    </div>
  )
}

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false)

  const isStudent = session?.user?.role === UserRole.STUDENT
  const isAlumni = session?.user?.role === UserRole.ALUMNI

  let pageTitle = 'Dashboard'
  if (pathname === '/dashboard/profile') pageTitle = 'Profile'
  else if (pathname === '/dashboard/student/mentors') pageTitle = 'Find Mentors'
  else if (pathname === '/dashboard/student/schedule') pageTitle = 'Schedule'
  else if (pathname === '/dashboard/student/sessions') pageTitle = 'Sessions'
  else if (pathname === '/dashboard/alumni/availability')
    pageTitle = 'Availability'
  else if (pathname === '/dashboard/alumni/requests') pageTitle = 'Requests'
  else if (pathname === '/dashboard/alumni/sessions') pageTitle = 'Sessions'

  const studentLinks = [
    {
      name: 'Find Mentors',
      href: '/dashboard/student/mentors',
      active: pathname === '/dashboard/student/mentors',
    },
    {
      name: 'Schedule',
      href: '/dashboard/student/schedule',
      active: pathname === '/dashboard/student/schedule',
    },
    {
      name: 'Sessions',
      href: '/dashboard/student/sessions',
      active: pathname === '/dashboard/student/sessions',
    },
  ]

  const alumniLinks = [
    {
      name: 'Availability',
      href: '/dashboard/alumni/availability',
      active: pathname === '/dashboard/alumni/availability',
    },
    {
      name: 'Requests',
      href: '/dashboard/alumni/requests',
      active: pathname === '/dashboard/alumni/requests',
    },
    {
      name: 'Sessions',
      href: '/dashboard/alumni/sessions',
      active: pathname === '/dashboard/alumni/sessions',
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <Logo />
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard/profile"
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === '/dashboard/profile'
                  ? 'text-foreground'
                  : 'text-foreground/60'
              )}
            >
              Profile
            </Link>
            {isStudent &&
              studentLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    link.active ? 'text-foreground' : 'text-foreground/60'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            {isAlumni &&
              alumniLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    link.active ? 'text-foreground' : 'text-foreground/60'
                  )}
                >
                  {link.name}
                </Link>
              ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          <Dialog
            open={isSignOutDialogOpen}
            onOpenChange={setIsSignOutDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign out</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sign Out</DialogTitle>
                <DialogDescription>
                  Are you sure you want to sign out of your account?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSignOutDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
