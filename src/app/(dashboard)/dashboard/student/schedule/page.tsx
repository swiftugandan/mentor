"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { set } from "date-fns"
import { toast } from "sonner"
import { Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/page-header"
import { Shell } from "@/components/shell"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MentorshipRequest } from "@/types"

interface Availability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export default function SchedulePage() {
  const queryClient = useQueryClient()
  const [selectedMentor, setSelectedMentor] = useState<MentorshipRequest | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Availability | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState<"ONLINE" | "IN_PERSON">("ONLINE")
  const [meetingType, setMeetingType] = useState<"VIDEO" | "AUDIO" | "IN_PERSON">("VIDEO")
  const [meetingLink, setMeetingLink] = useState("")
  const [agenda, setAgenda] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Reset states when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setSelectedDate(undefined)
      setSelectedTimeSlot(null)
      setTitle("")
      setDescription("")
      setLocation("ONLINE")
      setMeetingType("VIDEO")
      setMeetingLink("")
      setAgenda("")
    }
  }

  // Fetch accepted mentorship requests
  const { data: mentors = [], isLoading: isLoadingMentors } = useQuery<MentorshipRequest[]>({
    queryKey: ["mentorship-requests"],
    queryFn: async () => {
      const response = await fetch("/api/mentorship-requests")
      if (!response.ok) throw new Error("Failed to fetch mentorship requests")
      const requests = await response.json()
      return requests.filter((request: MentorshipRequest) => request.status === "ACCEPTED")
    },
  })

  // Fetch mentor's availability when selected
  const { data: availability = [] } = useQuery<Availability[]>({
    queryKey: ["availability", selectedMentor?.alumni.id],
    queryFn: async () => {
      if (!selectedMentor) return []
      const response = await fetch(`/api/availability?alumniId=${selectedMentor.alumni.id}`)
      if (!response.ok) throw new Error("Failed to fetch availability")
      return response.json()
    },
    enabled: !!selectedMentor,
  })

  // Create session mutation
  const createSession = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedMentor || !selectedTimeSlot) return

      // Parse the time strings and combine with selected date
      const [startHour, startMinute] = selectedTimeSlot.startTime.split(":").map(Number)
      const [endHour, endMinute] = selectedTimeSlot.endTime.split(":").map(Number)

      const startTime = set(selectedDate, { hours: startHour, minutes: startMinute })
      const endTime = set(selectedDate, { hours: endHour, minutes: endMinute })

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          mentorId: selectedMentor.alumni.id,
          location,
          meetingType,
          meetingLink: meetingLink || undefined,
          agenda: agenda || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to schedule session")
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
      toast.success("Session scheduled successfully")
      setIsDialogOpen(false)
      setTitle("")
      setDescription("")
      setSelectedDate(undefined)
      setSelectedTimeSlot(null)
      setLocation("ONLINE")
      setMeetingType("VIDEO")
      setMeetingLink("")
      setAgenda("")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleScheduleSession = () => {
    if (!title.trim()) {
      toast.error("Please enter a session title")
      return
    }

    if (!selectedDate) {
      toast.error("Please select a date")
      return
    }

    if (!selectedTimeSlot) {
      toast.error("Please select a time slot")
      return
    }

    if (location === "ONLINE" && !meetingLink.trim()) {
      toast.error("Please provide a meeting link for online sessions")
      return
    }

    createSession.mutate()
  }

  // Check if the selected date matches any availability slots
  const isDateAvailable = (date: Date) => {
    if (!availability.length) return false
    
    const dayOfWeek = date.getDay()
    return availability.some(slot => slot.dayOfWeek === dayOfWeek)
  }

  // Get available time slots for the selected date
  const getAvailableTimeSlots = (date: Date) => {
    if (!date) return []
    
    const dayOfWeek = date.getDay()
    return availability.filter(slot => slot.dayOfWeek === dayOfWeek)
  }

  return (
    <Shell>
      <PageHeader
        heading="Schedule a Session"
        text="Schedule mentorship sessions with your mentors"
      />

      {isLoadingMentors ? (
        <div className="flex h-[450px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading mentors...</p>
        </div>
      ) : mentors.length === 0 ? (
        <div className="flex h-[450px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any accepted mentorship requests yet.
            <br />
            Connect with mentors to schedule sessions.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {mentors.map((mentor) => (
            <Card key={mentor.id}>
              <CardHeader>
                <CardTitle>{mentor.alumni.name}</CardTitle>
                <CardDescription>
                  {mentor.alumni.alumniProfile.profession} at {mentor.alumni.alumniProfile.company}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      Schedule Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Schedule a Session</DialogTitle>
                      <DialogDescription>
                        Schedule a mentorship session with {mentor.alumni.name}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Left column */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Session Title</Label>
                            <Input
                              id="title"
                              placeholder="e.g., Career Guidance Discussion"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                            />
                          </div>

                          <div>
                            <Label>Session Type</Label>
                            <div className="grid gap-2 mt-2">
                              <Select value={location} onValueChange={(val: "ONLINE" | "IN_PERSON") => {
                                setLocation(val)
                                setMeetingType(val === "ONLINE" ? "VIDEO" : "IN_PERSON")
                              }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ONLINE">Online</SelectItem>
                                  <SelectItem value="IN_PERSON">In Person</SelectItem>
                                </SelectContent>
                              </Select>

                              {location === "ONLINE" && (
                                <Select value={meetingType} onValueChange={(val: "VIDEO" | "AUDIO") => setMeetingType(val)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select meeting type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="VIDEO">Video Call</SelectItem>
                                    <SelectItem value="AUDIO">Audio Call</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}

                              {location === "ONLINE" && (
                                <Input
                                  placeholder="Meeting link"
                                  value={meetingLink}
                                  onChange={(e) => setMeetingLink(e.target.value)}
                                />
                              )}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="What would you like to discuss?"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="h-[120px]"
                            />
                          </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-4">
                          <div>
                            <Label>Date & Time</Label>
                            <div className="border rounded-lg p-2 mt-2">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) => !isDateAvailable(date)}
                                className="w-full"
                              />
                            </div>
                          </div>

                          {selectedDate && (
                            <div>
                              <Label>Available Time Slots</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {getAvailableTimeSlots(selectedDate).map((slot) => (
                                  <Button
                                    key={slot.id}
                                    variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                                    className="w-full"
                                    onClick={() => setSelectedTimeSlot(slot)}
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    {slot.startTime} - {slot.endTime}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="agenda">Agenda</Label>
                        <Textarea
                          id="agenda"
                          placeholder="List the topics or questions you'd like to cover"
                          value={agenda}
                          onChange={(e) => setAgenda(e.target.value)}
                          className="h-[80px]"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={handleScheduleSession}
                        disabled={createSession.isPending}
                      >
                        {createSession.isPending ? "Scheduling..." : "Schedule Session"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  )
} 