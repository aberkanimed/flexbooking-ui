import { cn } from "@/lib/utils"

interface StatusPillProps {
  active: boolean
  sm?: boolean
  className?: string
}

export function StatusPill({ active, sm, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap shrink-0",
        sm ? "h-6 px-2.5 text-[12px]" : "h-7 px-3 text-[13px]",
        className
      )}
      style={
        active
          ? { background: "var(--status-active-bg)", color: "var(--status-active-fg)" }
          : { background: "var(--status-inactive-bg)", color: "var(--status-inactive-fg)" }
      }
    >
      <span className="size-[7px] rounded-full bg-current" />
      {active ? "Active" : "Inactive"}
    </span>
  )
}
