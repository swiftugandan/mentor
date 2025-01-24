import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export function AuthHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-3 sm:px-4">
        <Link
          href="/"
          className="flex items-center gap-1 transition-opacity hover:opacity-90"
        >
          <div className="relative">
            <GraduationCap className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
          </div>
          <span className="text-lg font-bold sm:text-xl">
            Alumni<span className="text-primary">Mentor</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
