import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-brand-border/70 dark:bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
