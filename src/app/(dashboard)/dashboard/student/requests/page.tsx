'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MentorshipRequest } from '@/types'
import { PageHeader } from '@/components/page-header'
import { Shell } from '@/components/shell'

const statusIcons = {
  PENDING: Clock,
  ACCEPTED: CheckCircle2,
  REJECTED: XCircle,
} as const

const statusColors = {
  PENDING: 'text-yellow-500',
  ACCEPTED: 'text-green-500',
  REJECTED: 'text-red-500',
} as const

export default function RequestsPage() {
  const { data: requests = [], isLoading } = useQuery<MentorshipRequest[]>({
    queryKey: ['mentorship-requests'],
    queryFn: async () => {
      const response = await fetch('/api/mentorship-requests')
      if (!response.ok) throw new Error('Failed to fetch requests')
      return response.json()
    },
  })

  const pendingRequests = requests.filter((req) => req.status === 'PENDING')
  const acceptedRequests = requests.filter((req) => req.status === 'ACCEPTED')
  const rejectedRequests = requests.filter((req) => req.status === 'REJECTED')

  const RequestCard = ({ request }: { request: MentorshipRequest }) => {
    const StatusIcon = statusIcons[request.status]

    return (
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="line-clamp-1 text-lg">
              {request.alumni.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <StatusIcon className={statusColors[request.status]} />
              <span className="text-sm font-medium capitalize text-muted-foreground">
                {request.status.toLowerCase()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Profession</div>
            <div className="text-sm text-muted-foreground">
              {request.alumni.alumniProfile.profession} at{' '}
              {request.alumni.alumniProfile.company}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Message</div>
            <div className="text-sm text-muted-foreground">
              {request.message}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Sent</div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(request.createdAt), 'PPP')}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Shell className="gap-8">
      <PageHeader
        heading="My Requests"
        text="Track the status of your mentorship requests"
      />
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto bg-background sm:w-auto">
          <TabsTrigger value="pending" className="min-w-[100px]">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="min-w-[100px]">
            Accepted ({acceptedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="min-w-[100px]">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="flex min-h-[450px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                Loading requests...
              </p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                No pending requests
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {isLoading ? (
            <div className="flex min-h-[450px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                Loading requests...
              </p>
            </div>
          ) : acceptedRequests.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                No accepted requests
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {acceptedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {isLoading ? (
            <div className="flex min-h-[450px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                Loading requests...
              </p>
            </div>
          ) : rejectedRequests.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                No rejected requests
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {rejectedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Shell>
  )
}
