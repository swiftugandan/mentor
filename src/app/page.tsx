/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { ArrowRight, GraduationCap, Users, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function Logo() {
  return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <GraduationCap className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
      </div>
      <span className="text-lg font-bold sm:text-xl">
        Alumni<span className="text-primary">Mentor</span>
      </span>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-sm sm:h-9 sm:px-4"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="h-8 px-2 text-sm sm:h-9 sm:px-4">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex justify-center space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="flex max-w-[64rem] flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
            <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl lg:text-6xl">
              Your Bridge to{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Professional Success
              </span>
            </h1>
            <p className="max-w-[42rem] text-sm leading-normal text-muted-foreground sm:text-base md:text-xl md:leading-8">
              Connect with experienced alumni mentors who can guide you through
              your academic journey and help shape your future career path.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  Start Your Journey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="flex justify-center py-8 md:py-12 lg:py-24">
          <div className="flex max-w-[64rem] flex-col items-center gap-8 px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-2xl leading-[1.1] sm:text-3xl md:text-5xl">
                Why Choose Alumni Mentor?
              </h2>
              <p className="max-w-[85%] text-sm leading-normal text-muted-foreground sm:text-base sm:leading-7">
                Our platform offers unique opportunities to connect, learn, and
                grow with experienced mentors who've walked your path.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              <Card className="flex flex-col items-center">
                <CardHeader>
                  <div className="mb-4 rounded-full bg-primary/10 p-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Expert Guidance</CardTitle>
                  <CardDescription>
                    Get personalized advice from successful alumni in your field
                    of interest
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex flex-col items-center">
                <CardHeader>
                  <div className="mb-4 rounded-full bg-primary/10 p-2">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>1:1 Mentorship</CardTitle>
                  <CardDescription>
                    Build meaningful connections through one-on-one mentoring
                    sessions
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex flex-col items-center">
                <CardHeader>
                  <div className="mb-4 rounded-full bg-primary/10 p-2">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Career Planning</CardTitle>
                  <CardDescription>
                    Set and achieve your academic and career goals with expert
                    insights
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="flex justify-center bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="flex max-w-[64rem] flex-col items-center gap-8 px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-2xl leading-[1.1] sm:text-3xl md:text-5xl">
                How It Works
              </h2>
              <p className="max-w-[85%] text-sm leading-normal text-muted-foreground sm:text-base sm:leading-7">
                Get started with Alumni Mentor in three simple steps
              </p>
            </div>
            <div className="mx-auto grid w-full justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      1
                    </span>
                    Create Profile
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Sign up and tell us about your interests and goals
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      2
                    </span>
                    Find Mentors
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Browse and connect with mentors in your areas of interest
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      3
                    </span>
                    Start Learning
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Schedule sessions and begin your mentorship journey
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="flex justify-center py-8 md:py-12 lg:py-24">
          <div className="flex max-w-[64rem] flex-col items-center px-4 md:px-6">
            <div className="relative w-full overflow-hidden rounded-lg bg-primary px-4 py-12 sm:px-12 sm:py-24 md:px-16">
              <div className="relative flex flex-col items-center justify-center gap-4 text-center">
                <h2 className="font-heading text-2xl text-white sm:text-3xl md:text-4xl">
                  Ready to Start Your Journey?
                </h2>
                <p className="max-w-[42rem] text-sm text-white/80 sm:text-base sm:leading-8">
                  Join our community of students and mentors today and take the
                  first step towards your future success.
                </p>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="mt-4 w-full sm:w-auto"
                  >
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center gap-4 px-4 py-4 md:h-14 md:flex-row md:justify-between md:px-6 md:py-0">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AlumniMentor. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
