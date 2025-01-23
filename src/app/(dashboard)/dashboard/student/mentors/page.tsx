'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/page-header'
import { Shell } from '@/components/shell'

const expertiseAreas = [
  'All Areas',
  'Engineering',
  'Business',
  'Medicine',
  'Law',
  'Education',
  'Technology',
  'Arts',
  'Science',
] as const

type ExpertiseArea = (typeof expertiseAreas)[number]

interface Mentor {
  id: string
  name: string
  alumniProfile: {
    profession: string
    company: string
    expertise: string[]
    bio?: string
  }
}

export default function MentorsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    },
  })

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <Shell>
        <PageHeader
          heading="Find Mentors"
          text="Connect with alumni mentors who can guide you on your journey"
        />
        <div className="flex h-[450px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </Shell>
    )
  }

  // Redirect if not a student
  if (session?.user?.role !== UserRole.STUDENT) {
    redirect('/dashboard')
    return null
  }

  return <MentorsContent />
}

function MentorsContent() {
  const [search, setSearch] = useState('')
  const [expertise, setExpertise] = useState<ExpertiseArea>('All Areas')
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [message, setMessage] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: mentors, isLoading } = useQuery<Mentor[]>({
    queryKey: ['mentors', search, expertise],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (expertise !== 'All Areas') params.append('expertise', expertise)

      const response = await fetch(`/api/mentors?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch mentors')
      return response.json()
    },
  })

  const requestMutation = useMutation({
    mutationFn: async ({
      alumniId,
      message,
    }: {
      alumniId: string
      message: string
    }) => {
      const response = await fetch('/api/mentorship-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alumniId, message }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send request')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Mentorship request sent successfully')
      setIsDialogOpen(false)
      setMessage('')
      setSelectedMentor(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleRequestMentorship = (mentor: Mentor) => {
    setSelectedMentor(mentor)
    setIsDialogOpen(true)
  }

  const handleSubmitRequest = () => {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!selectedMentor) return

    requestMutation.mutate({
      alumniId: selectedMentor.id,
      message: message.trim(),
    })
  }

  return (
    <Shell className="gap-8">
      <PageHeader
        heading="Find Mentors"
        text="Connect with alumni mentors who can guide you on your journey"
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by profession or company..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={expertise}
          onValueChange={(value: ExpertiseArea) => setExpertise(value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by expertise" />
          </SelectTrigger>
          <SelectContent>
            {expertiseAreas.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex min-h-[450px] items-center justify-center rounded-lg border bg-muted/40">
          <p className="text-sm text-muted-foreground">Loading mentors...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mentors?.map((mentor) => (
            <Card key={mentor.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{mentor.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {mentor.alumniProfile.profession} at{' '}
                  {mentor.alumniProfile.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Expertise</div>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.alumniProfile.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {mentor.alumniProfile.bio && (
                  <div className="space-y-2">
                    <div className="font-medium">Bio</div>
                    <div className="line-clamp-3 text-sm text-muted-foreground">
                      {mentor.alumniProfile.bio}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleRequestMentorship(mentor)}
                  disabled={requestMutation.isPending}
                >
                  Request Mentorship
                </Button>
              </CardFooter>
            </Card>
          ))}
          {mentors?.length === 0 && (
            <div className="col-span-full flex min-h-[200px] items-center justify-center rounded-lg border bg-muted/40">
              <p className="text-sm text-muted-foreground">
                No mentors found matching your criteria.
              </p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a message to {selectedMentor?.name} explaining why you&apos;d
              like them to be your mentor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={requestMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={requestMutation.isPending}
              className="w-full sm:w-auto"
            >
              {requestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  )
}
