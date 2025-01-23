'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Clock,
  XCircle,
  Video,
  Mic,
  Users,
  Link,
  CalendarDays,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MentorshipSession, SessionStatus } from '@/types'
import { PageHeader } from '@/components/page-header'
import { Shell } from '@/components/shell'

const statusIcons = {
  SCHEDULED: Clock,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
} as const

const statusColors = {
  SCHEDULED: 'text-yellow-500',
  COMPLETED: 'text-green-500',
  CANCELLED: 'text-red-500',
} as const

const meetingTypeIcons = {
  VIDEO: Video,
  AUDIO: Mic,
  IN_PERSON: Users,
} as const

export default function SessionsPage() {
  const queryClient = useQueryClient()
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)

  const { data: sessions = [], isLoading } = useQuery<MentorshipSession[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await fetch('/api/sessions')
      if (!response.ok) throw new Error('Failed to fetch sessions')
      return response.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
      feedback,
    }: {
      id: string
      status: SessionStatus
      notes?: string
      feedback?: string
    }) => {
      const response = await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes, feedback }),
      })
      if (!response.ok) throw new Error('Failed to update session')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session updated successfully')
    },
    onError: () => {
      toast.error('Failed to update session')
    },
  })

  const scheduledSessions = sessions.filter(
    (session) => session.status === 'SCHEDULED'
  )
  const pastSessions = sessions.filter((session) =>
    ['COMPLETED', 'CANCELLED'].includes(session.status)
  )

  const handleDialogOpenChange = (open: boolean) => {
    setIsCompleteDialogOpen(open)
    if (!open) {
      setSelectedSession(null)
      setNotes('')
      setFeedback('')
    }
  }

  const handleCompleteSession = (sessionId: string) => {
    setSelectedSession(sessionId)
    setIsCompleteDialogOpen(true)
  }

  const handleSubmitCompletion = () => {
    if (!selectedSession) return

    updateMutation.mutate(
      {
        id: selectedSession,
        status: 'COMPLETED',
        notes: notes.trim(),
        feedback: feedback.trim(),
      },
      {
        onSuccess: () => {
          handleDialogOpenChange(false)
        },
      }
    )
  }

  const SessionCard = ({ session }: { session: MentorshipSession }) => {
    const StatusIcon = statusIcons[session.status]
    const MeetingTypeIcon = meetingTypeIcons[session.meetingType]

    return (
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="line-clamp-1 text-lg">
                {session.title}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                with {session.student.name}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  session.location === 'ONLINE' ? 'default' : 'secondary'
                }
                className="whitespace-nowrap"
              >
                <MeetingTypeIcon className="mr-1 h-3 w-3" />
                {session.location === 'ONLINE'
                  ? `Online (${session.meetingType})`
                  : 'In Person'}
              </Badge>
              <StatusIcon className={statusColors[session.status]} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Student</div>
            <div className="text-sm text-muted-foreground">
              Grade {session.student.studentProfile.gradeLevel} at{' '}
              {session.student.studentProfile.schoolName}
            </div>
          </div>

          {session.description && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Description</div>
              <div className="line-clamp-3 text-sm text-muted-foreground">
                {session.description}
              </div>
            </div>
          )}

          {session.agenda && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Agenda
              </div>
              <div className="line-clamp-3 text-sm text-muted-foreground">
                {session.agenda}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <CalendarDays className="h-4 w-4" />
              Time
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(session.startTime), 'PPP p')} -{' '}
              {format(new Date(session.endTime), 'p')}
            </div>
          </div>

          {session.location === 'ONLINE' && session.meetingLink && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Link className="h-4 w-4" />
                Meeting Link
              </div>
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Join Meeting
              </a>
            </div>
          )}
        </CardContent>
        {session.status === 'SCHEDULED' && (
          <CardFooter className="flex-col gap-2 border-t bg-muted/40 p-4 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() =>
                updateMutation.mutate({
                  id: session.id,
                  status: 'CANCELLED',
                })
              }
              disabled={updateMutation.isPending}
            >
              Cancel Session
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => handleCompleteSession(session.id)}
              disabled={updateMutation.isPending}
            >
              Complete Session
            </Button>
          </CardFooter>
        )}

        {session.status === 'COMPLETED' && (
          <CardFooter className="flex-col space-y-4 border-t bg-muted/40 p-4">
            {session.notes && (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Session Notes
                </div>
                <div className="text-sm text-muted-foreground">
                  {session.notes}
                </div>
              </div>
            )}
            {session.feedback && (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Feedback for Student
                </div>
                <div className="text-sm text-muted-foreground">
                  {session.feedback}
                </div>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    )
  }

  return (
    <Shell className="gap-8">
      <PageHeader
        heading="Mentorship Sessions"
        text="View and manage your mentorship sessions"
      />

      <Dialog open={isCompleteDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
            <DialogDescription>
              Add notes and feedback for this session
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Session Notes
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your private notes about the session..."
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Feedback for Student
              </div>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add feedback for the student..."
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCompletion}
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateMutation.isPending ? 'Completing...' : 'Complete Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto bg-background sm:w-auto">
          <TabsTrigger value="upcoming" className="min-w-[100px]">
            Upcoming ({scheduledSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="min-w-[100px]">
            Past ({pastSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="flex min-h-[450px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                Loading sessions...
              </p>
            </div>
          ) : scheduledSessions.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                No upcoming sessions
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {scheduledSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <div className="flex min-h-[450px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                Loading sessions...
              </p>
            </div>
          ) : pastSessions.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">No past sessions</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {pastSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Shell>
  )
}
