'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import {
  Users,
  Calendar,
  Clock,
  MessageSquare,
  GraduationCap,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { MobileNav } from '@/components/mobile-nav'
import { UserNav } from '@/components/user-nav'

interface NavItem {
  href: string
  title: string
  label?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isStudent = session?.user?.role === UserRole.STUDENT
  const isAlumni = session?.user?.role === UserRole.ALUMNI

  const studentItems: NavItem[] = [
    {
      href: '/dashboard/student/mentors',
      title: 'Find Mentors',
      icon: Users,
    },
    {
      href: '/dashboard/student/requests',
      title: 'My Requests',
      icon: MessageSquare,
    },
    {
      href: '/dashboard/student/sessions',
      title: 'Sessions',
      icon: Calendar,
    },
  ]

  const alumniItems: NavItem[] = [
    {
      href: '/dashboard/alumni/requests',
      title: 'Mentorship Requests',
      icon: MessageSquare,
    },
    {
      href: '/dashboard/alumni/sessions',
      title: 'Sessions',
      icon: Calendar,
    },
    {
      href: '/dashboard/alumni/availability',
      title: 'Availability',
      icon: Clock,
    },
  ]

  const items = isStudent ? studentItems : isAlumni ? alumniItems : []

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex flex-1 items-center">
          <MobileNav items={items} />
          <div className="mr-4 hidden lg:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold">Mentor</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 transition-colors hover:text-foreground/80',
                    pathname === item.href
                      ? 'text-foreground'
                      : 'text-foreground/60'
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                  {item.label && (
                    <span className="ml-2 rounded-md bg-[#E11D48] px-1.5 py-0.5 text-xs text-white">
                      {item.label}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex items-center">
          <UserNav />
        </div>
      </div>
    </header>
  )
}
