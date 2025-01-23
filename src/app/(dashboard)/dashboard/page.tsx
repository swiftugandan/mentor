'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { UserRole } from '@prisma/client'
import { format } from 'date-fns'
import { Users, Calendar, Send, CheckCircle2, ArrowRight } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { Shell } from '@/components/shell'
import { MentorshipRequest, MentorshipSession } from '@/types'
import Link from 'next/link'

interface SessionActivity {
  id: string
  type: 'session'
  title: string
  startTime: string
  createdAt: string
  status: string
  student?: { name: string }
  mentor?: { name: string }
}

interface RequestActivity {
  id: string
  type: 'request'
  status: string
  createdAt: string
  student?: { name: string }
  alumni?: { name: string }
}

type Activity = SessionActivity | RequestActivity

export default function DashboardPage() {
  const { data: session } = useSession()
  const isStudent = session?.user?.role === UserRole.STUDENT

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      return response.json()
    },
  })

  const { data: sessions = [] } = useQuery<MentorshipSession[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await fetch('/api/sessions')
      if (!response.ok) throw new Error('Failed to fetch sessions')
      return response.json()
    },
  })

  const { data: mentorshipRequests = [] } = useQuery<MentorshipRequest[]>({
    queryKey: ['mentorship-requests'],
    queryFn: async () => {
      const response = await fetch('/api/mentorship-requests')
      if (!response.ok) throw new Error('Failed to fetch mentorship requests')
      return response.json()
    },
  })

  const { data: mentors = [] } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const response = await fetch('/api/mentors')
      if (!response.ok) throw new Error('Failed to fetch mentors')
      return response.json()
    },
    enabled: isStudent,
  })

  const upcomingSessions = sessions.filter(
    (session) => session.status === 'SCHEDULED'
  )
  const acceptedRequests = mentorshipRequests.filter(
    (request) => request.status === 'ACCEPTED'
  )

  const recentActivity: Activity[] = [
    ...upcomingSessions.map(
      (session): SessionActivity => ({
        id: session.id,
        type: 'session',
        title: session.title,
        startTime: session.startTime,
        createdAt: session.createdAt,
        status: session.status,
        student: session.student,
        mentor: session.mentor,
      })
    ),
    ...mentorshipRequests.map(
      (request): RequestActivity => ({
        id: request.id,
        type: 'request',
        status: request.status,
        createdAt: request.createdAt,
        student: request.student,
        alumni: request.alumni,
      })
    ),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  return (
    <Shell>
      <PageHeader
        heading={`Welcome back, ${session?.user?.name}`}
        text={
          isStudent
            ? "Here's what's happening with your mentorship journey"
            : "Here's an overview of your mentorship activities"
        }
      />

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isStudent ? 'Available Mentors' : 'Active Mentees'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStudent ? mentors.length : acceptedRequests.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {isStudent
                  ? 'Mentors available to connect with'
                  : "Students you're currently mentoring"}
              </p>
              <Button variant="link" className="mt-4 h-auto p-0" asChild>
                <Link
                  href={
                    isStudent
                      ? '/dashboard/student/mentors'
                      : '/dashboard/alumni/requests'
                  }
                >
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Scheduled mentorship sessions
              </p>
              <Button variant="link" className="mt-4 h-auto p-0" asChild>
                <Link
                  href={
                    isStudent
                      ? '/dashboard/student/sessions'
                      : '/dashboard/alumni/sessions'
                  }
                >
                  View calendar <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isStudent ? 'Active Mentors' : 'Session Hours'}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {acceptedRequests.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {isStudent
                  ? 'Mentors who accepted your requests'
                  : 'Total hours of mentorship'}
              </p>
              <Button variant="link" className="mt-4 h-auto p-0" asChild>
                <Link
                  href={
                    isStudent
                      ? '/dashboard/student/requests'
                      : '/dashboard/alumni/sessions'
                  }
                >
                  View details <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isStudent ? 'Pending Requests' : 'Available Hours'}
              </CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  mentorshipRequests.filter((r) => r.status === 'PENDING')
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {isStudent
                  ? 'Mentorship requests awaiting response'
                  : 'Weekly hours available for mentoring'}
              </p>
              <Button variant="link" className="mt-4 h-auto p-0" asChild>
                <Link
                  href={
                    isStudent
                      ? '/dashboard/student/requests'
                      : '/dashboard/alumni/availability'
                  }
                >
                  {isStudent ? 'Check status' : 'Manage hours'}{' '}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest mentorship interactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-lg border bg-muted/40">
                  <p className="text-sm text-muted-foreground">
                    No recent activity to show.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 rounded-lg border bg-muted/40 p-4"
                    >
                      {activity.type === 'session' ? (
                        <>
                          <Calendar className="h-5 w-5 text-primary" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Session with{' '}
                              {isStudent
                                ? activity.mentor?.name
                                : activity.student?.name}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(
                              new Date(activity.startTime),
                              'MMM d, h:mm a'
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 text-primary" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Mentorship Request {activity.status.toLowerCase()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isStudent
                                ? `To ${activity.alumni?.name}`
                                : `From ${activity.student?.name}`}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(
                              new Date(activity.createdAt),
                              'MMM d, h:mm a'
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>
                    {isStudent ? 'Your Interests' : 'Your Expertise'}
                  </CardTitle>
                  <CardDescription>
                    {isStudent
                      ? 'Areas you want to learn about'
                      : 'Topics you can help with'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/profile">Edit Profile</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="flex flex-wrap gap-2">
                  {(isStudent
                    ? profile.studentProfile?.interests
                    : profile.alumniProfile?.expertise
                  )?.map((item: string) => (
                    <div
                      key={item}
                      className="rounded-lg border bg-muted/40 px-3 py-1 text-sm"
                    >
                      {item}
                    </div>
                  )) || (
                    <div className="flex h-[100px] items-center justify-center rounded-lg border bg-muted/40">
                      <p className="text-sm text-muted-foreground">
                        No {isStudent ? 'interests' : 'expertise'} added yet.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-[100px] items-center justify-center rounded-lg border bg-muted/40">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
