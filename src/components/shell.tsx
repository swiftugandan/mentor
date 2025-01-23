import { cn } from "@/lib/utils"

export function Shell({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid items-start gap-8 p-8", className)}
      {...props}
    >
      {children}
    </div>
  )
} 