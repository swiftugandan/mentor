"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { UserRole } from "@prisma/client"
import { toast } from "sonner"
import { BadgeCheck, Building2, GraduationCap, Mail, User } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { Shell } from "@/components/shell"
import { cn } from "@/lib/utils"

const EXPERTISE_AREAS = [
  "Career Guidance",
  "College Applications",
  "Interview Preparation",
  "Resume Building",
  "Industry Insights",
  "Academic Advice",
  "Leadership",
  "Networking",
]

const STUDENT_INTERESTS = [
  "Career Exploration",
  "College Preparation",
  "Academic Excellence",
  "Leadership Development",
  "Research",
  "Internships",
  "Technology",
  "Arts",
  "Science",
  "Business",
]

export default function ProfilePage() {
  const { data: session } = useSession()
  const isStudent = session?.user?.role === UserRole.STUDENT
  const queryClient = useQueryClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])

  // Student-specific fields
  const [gradeLevel, setGradeLevel] = useState("")
  const [schoolName, setSchoolName] = useState("")

  // Alumni-specific fields
  const [profession, setProfession] = useState("")
  const [company, setCompany] = useState("")
  const [graduationYear, setGraduationYear] = useState("")

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile")
      if (!response.ok) throw new Error("Failed to fetch profile")
      return response.json()
    },
  })

  // Initialize form data when dialog opens
  const initializeFormData = () => {
    if (!profile) return

    setName(profile.name)
    setBio(profile.studentProfile?.bio || profile.alumniProfile?.bio || "")
    
    if (isStudent && profile.studentProfile) {
      setGradeLevel(profile.studentProfile.gradeLevel.toString())
      setSchoolName(profile.studentProfile.schoolName)
      setSelectedInterests(profile.studentProfile.interests)
    } else if (!isStudent && profile.alumniProfile) {
      setProfession(profile.alumniProfile.profession)
      setCompany(profile.alumniProfile.company)
      setGraduationYear(profile.alumniProfile.graduationYear.toString())
      setSelectedExpertise(profile.alumniProfile.expertise)
    }
  }

  // Reset form data when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (open) {
      initializeFormData()
    }
  }

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      toast.success("Profile updated successfully")
      setIsDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const baseData = {
      name,
      bio,
    }

    if (isStudent) {
      updateMutation.mutate({
        ...baseData,
        gradeLevel: parseInt(gradeLevel),
        schoolName,
        interests: selectedInterests,
      })
    } else {
      updateMutation.mutate({
        ...baseData,
        profession,
        company,
        graduationYear: parseInt(graduationYear),
        expertise: selectedExpertise,
      })
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const toggleExpertise = (area: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    )
  }

  if (isLoading) {
    return (
      <Shell>
        <PageHeader
          heading="Profile"
          text="Manage your profile information and preferences"
        />
        <div className="flex h-[450px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <PageHeader
        heading="Profile"
        text="Manage your profile information and preferences"
      >
        <Button onClick={() => handleDialogOpenChange(true)}>Edit Profile</Button>
      </PageHeader>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              {isStudent ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="gradeLevel">Grade Level</Label>
                      <Input
                        id="gradeLevel"
                        type="number"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Areas of Interest</Label>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {STUDENT_INTERESTS.map((interest) => (
                        <Button
                          key={interest}
                          type="button"
                          variant={selectedInterests.includes(interest) ? "default" : "outline"}
                          className="h-auto justify-start whitespace-normal p-3 text-left"
                          onClick={() => toggleInterest(interest)}
                        >
                          {interest}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profession">Profession</Label>
                      <Input
                        id="profession"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Areas of Expertise</Label>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {EXPERTISE_AREAS.map((area) => (
                        <Button
                          key={area}
                          type="button"
                          variant={selectedExpertise.includes(area) ? "default" : "outline"}
                          className="h-auto justify-start whitespace-normal p-3 text-left"
                          onClick={() => toggleExpertise(area)}
                        >
                          {area}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your basic information and how others see you on the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4">
              <User className="h-9 w-9 text-primary" />
              <div className="space-y-1">
                <div className="text-sm font-medium">Name</div>
                <div className="text-sm text-muted-foreground">{profile?.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="h-9 w-9 text-primary" />
              <div className="space-y-1">
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
              </div>
            </div>
            {profile?.bio && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Bio</div>
                <div className="text-sm text-muted-foreground">{profile.bio}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {isStudent ? (
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>
                Your academic details and areas of interest
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center gap-4">
                <GraduationCap className="h-9 w-9 text-primary" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Education</div>
                  <div className="text-sm text-muted-foreground">
                    Grade {profile?.studentProfile?.gradeLevel} at {profile?.studentProfile?.schoolName}
                  </div>
                </div>
              </div>
              {profile?.studentProfile?.interests.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Areas of Interest</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.studentProfile.interests.map((interest) => (
                      <div
                        key={interest}
                        className="rounded-lg border bg-muted/40 px-3 py-1 text-sm"
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Your work experience and areas of expertise
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center gap-4">
                <Building2 className="h-9 w-9 text-primary" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Current Position</div>
                  <div className="text-sm text-muted-foreground">
                    {profile?.alumniProfile?.profession} at {profile?.alumniProfile?.company}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <BadgeCheck className="h-9 w-9 text-primary" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Graduation Year</div>
                  <div className="text-sm text-muted-foreground">
                    {profile?.alumniProfile?.graduationYear}
                  </div>
                </div>
              </div>
              {profile?.alumniProfile?.expertise.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Areas of Expertise</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.alumniProfile.expertise.map((area) => (
                      <div
                        key={area}
                        className="rounded-lg border bg-muted/40 px-3 py-1 text-sm"
                      >
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  )
} 