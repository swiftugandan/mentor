import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  CircleUser,
  LayoutDashboard,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  items: {
    href: string
    title: string
    label?: string
  }[]
}

const icons = {
  'Find Mentors': Users,
  'My Requests': MessageSquare,
  Sessions: Calendar,
  'Mentorship Requests': MessageSquare,
  Availability: Clock,
} as const

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pl-1 pr-0">
        <SheetHeader className="px-6">
          <SheetTitle className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setOpen(false)}
            >
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold">Mentor</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] px-6">
          <div className="flex flex-col space-y-3">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center space-x-2 text-sm font-medium text-muted-foreground',
                pathname === '/dashboard' && 'text-foreground'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center space-x-2 text-sm font-medium text-muted-foreground',
                pathname === '/dashboard/profile' && 'text-foreground'
              )}
            >
              <CircleUser className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <div className="my-2 border-t" />
            {items.map((item) => {
              const Icon = icons[item.title as keyof typeof icons]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center space-x-2 text-sm font-medium text-muted-foreground',
                    pathname === item.href && 'text-foreground'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                  {item.label && (
                    <span className="ml-2 rounded-md bg-[#E11D48] px-1.5 py-0.5 text-xs text-white">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
