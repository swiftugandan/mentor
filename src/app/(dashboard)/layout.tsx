"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { UserRole } from "@prisma/client"
import { LogOut, User, Users, Calendar, Send, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isStudent = session?.user?.role === UserRole.STUDENT
  const isAlumni = session?.user?.role === UserRole.ALUMNI

  const navigation = [
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
      active: pathname === "/dashboard/profile",
    },
    ...(isStudent
      ? [
          {
            name: "Find Mentors",
            href: "/dashboard/student/mentors",
            icon: Users,
            active: pathname === "/dashboard/student/mentors",
          },
          {
            name: "My Requests",
            href: "/dashboard/student/requests",
            icon: Send,
            active: pathname === "/dashboard/student/requests",
          },
          {
            name: "My Sessions",
            href: "/dashboard/student/sessions",
            icon: Calendar,
            active: pathname === "/dashboard/student/sessions",
          },
        ]
      : []),
    ...(isAlumni
      ? [
          {
            name: "Mentorship Requests",
            href: "/dashboard/alumni/requests",
            icon: Users,
            active: pathname === "/dashboard/alumni/requests",
          },
          {
            name: "My Sessions",
            href: "/dashboard/alumni/sessions",
            icon: Calendar,
            active: pathname === "/dashboard/alumni/sessions",
          },
          {
            name: "Availability",
            href: "/dashboard/alumni/availability",
            icon: Clock,
            active: pathname === "/dashboard/alumni/availability",
          },
        ]
      : []),
  ]

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 