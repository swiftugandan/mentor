import { cn } from '@/lib/utils'

export function Shell({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('grid items-start gap-8 px-4 lg:px-8', className)}
      {...props}
    >
      {children}
    </div>
  )
}
