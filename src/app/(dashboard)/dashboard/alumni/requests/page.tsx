'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { Shell } from '@/components/shell'
import { MentorshipRequest, MentorshipRequestStatus } from '@/types'

export default function RequestsPage() {
  const queryClient = useQueryClient()

  const { data: requests = [], isLoading } = useQuery<MentorshipRequest[]>({
    queryKey: ['mentorship-requests'],
    queryFn: async () => {
      const response = await fetch('/api/mentorship-requests')
      if (!response.ok) throw new Error('Failed to fetch requests')
      return response.json()
    },
  })

  const updateRequestMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: MentorshipRequestStatus
    }) => {
      const response = await fetch(`/api/mentorship-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update request')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] })
      toast.success('Request updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleUpdateRequest = (id: string, status: MentorshipRequestStatus) => {
    updateRequestMutation.mutate({ id, status })
  }

  const pendingRequests = requests.filter((req) => req.status === 'PENDING')
  const otherRequests = requests.filter((req) => req.status !== 'PENDING')

  return (
    <Shell>
      <PageHeader
        heading="Mentorship Requests"
        text="View and manage incoming mentorship requests"
      />
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex h-[450px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading requests...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pending Requests</h3>
              {pendingRequests.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-lg border bg-muted/40">
                  <p className="text-sm text-muted-foreground">
                    No pending requests
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <CardHeader className="border-b bg-muted/40">
                        <CardTitle>{request.student.name}</CardTitle>
                        <CardDescription>
                          Grade {request.student.studentProfile.gradeLevel} at{' '}
                          {request.student.studentProfile.schoolName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Interests</div>
                          <div className="text-sm text-muted-foreground">
                            {request.student.studentProfile.interests.join(
                              ', '
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Message</div>
                          <div className="text-sm text-muted-foreground">
                            {request.message}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/40 p-4">
                        <div className="flex w-full gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                              handleUpdateRequest(request.id, 'REJECTED')
                            }
                            disabled={updateRequestMutation.isPending}
                          >
                            Decline
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() =>
                              handleUpdateRequest(request.id, 'ACCEPTED')
                            }
                            disabled={updateRequestMutation.isPending}
                          >
                            Accept
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {otherRequests.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Past Requests</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {otherRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <CardHeader className="border-b bg-muted/40">
                        <CardTitle>{request.student.name}</CardTitle>
                        <CardDescription>
                          Status:{' '}
                          {request.status.charAt(0) +
                            request.status.slice(1).toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Message</div>
                          <div className="text-sm text-muted-foreground">
                            {request.message}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Shell>
  )
}
