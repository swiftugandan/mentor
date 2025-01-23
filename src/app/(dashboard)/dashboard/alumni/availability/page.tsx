"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { Shell } from "@/components/shell"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AvailabilitySlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  location: "ONLINE" | "IN_PERSON"
  meetingType: "VIDEO" | "AUDIO" | "IN_PERSON"
  meetingLink?: string
  venue?: string
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export default function AvailabilityPage() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState<"ONLINE" | "IN_PERSON">("ONLINE")
  const [meetingType, setMeetingType] = useState<"VIDEO" | "AUDIO" | "IN_PERSON">("VIDEO")
  const [meetingLink, setMeetingLink] = useState("")
  const [venue, setVenue] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data: availability = [], isLoading } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability"],
    queryFn: async () => {
      const response = await fetch("/api/availability")
      if (!response.ok) throw new Error("Failed to fetch availability")
      return response.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: {
      dayOfWeek: number
      startTime: string
      endTime: string
      location: "ONLINE" | "IN_PERSON"
      meetingType: "VIDEO" | "AUDIO" | "IN_PERSON"
      meetingLink?: string
      venue?: string
    }) => {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create availability")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Availability slot added")
      setStartTime("")
      setEndTime("")
      setMeetingLink("")
      setVenue("")
      setIsDialogOpen(false)
    },
    onError: () => {
      toast.error("Failed to add availability slot")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/availability?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete availability")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Availability slot removed")
    },
    onError: () => {
      toast.error("Failed to remove availability slot")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDay) return

    createMutation.mutate({
      dayOfWeek: selectedDay.getDay(),
      startTime,
      endTime,
      location,
      meetingType,
      ...(location === "ONLINE" && meetingLink ? { meetingLink } : {}),
      ...(location === "IN_PERSON" && venue ? { venue } : {}),
    })
  }

  // Group availability slots by day
  const availabilityByDay = availability.reduce((acc: Record<number, AvailabilitySlot[]>, slot: AvailabilitySlot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = []
    }
    acc[slot.dayOfWeek].push(slot)
    return acc
  }, {})

  return (
    <Shell>
      <PageHeader
        heading="Manage Availability"
        text="Set your weekly availability for mentorship sessions"
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                className="rounded-md border"
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    Add Availability for {selectedDay ? format(selectedDay, 'EEEE') : 'Selected Day'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Availability for {selectedDay ? format(selectedDay, 'EEEE') : 'Selected Day'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <RadioGroup
                        value={location}
                        onValueChange={(value: "ONLINE" | "IN_PERSON") => {
                          setLocation(value)
                          if (value === "ONLINE") {
                            setMeetingType("VIDEO")
                          } else {
                            setMeetingType("IN_PERSON")
                          }
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ONLINE" id="online" />
                          <Label htmlFor="online">Online</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="IN_PERSON" id="in-person" />
                          <Label htmlFor="in-person">In Person</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {location === "ONLINE" && (
                      <>
                        <div className="space-y-2">
                          <Label>Meeting Type</Label>
                          <Select
                            value={meetingType}
                            onValueChange={(value: "VIDEO" | "AUDIO") => setMeetingType(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VIDEO">Video</SelectItem>
                              <SelectItem value="AUDIO">Audio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="meetingLink">Default Meeting Link (Optional)</Label>
                          <Input
                            id="meetingLink"
                            type="url"
                            placeholder="https://zoom.us/j/..."
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {location === "IN_PERSON" && (
                      <div className="space-y-2">
                        <Label htmlFor="venue">Venue</Label>
                        <Input
                          id="venue"
                          placeholder="Enter meeting location..."
                          value={venue}
                          onChange={(e) => setVenue(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <Button type="submit" disabled={createMutation.isPending || !selectedDay}>
                      Add Time Slot
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[450px] items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading availability...</p>
              </div>
            ) : Object.keys(availabilityByDay).length === 0 ? (
              <div className="flex h-[450px] items-center justify-center">
                <p className="text-sm text-muted-foreground">No availability slots set</p>
              </div>
            ) : (
              <div className="space-y-6">
                {DAYS_OF_WEEK.map((day, index) => {
                  const daySlots = availabilityByDay[index] || []
                  if (daySlots.length === 0) return null

                  return (
                    <div key={day} className="space-y-3">
                      <h3 className="font-semibold">{day}</h3>
                      <div className="space-y-2">
                        {daySlots.map((slot: AvailabilitySlot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between rounded-lg border p-3 shadow-sm"
                          >
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {slot.location === "ONLINE" ? (
                                  <>Online ({slot.meetingType})</>
                                ) : (
                                  <>In Person - {slot.venue}</>
                                )}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMutation.mutate(slot.id)}
                              disabled={deleteMutation.isPending}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
} 