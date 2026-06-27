import { BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingTopBarProps {
  currentStep: number
  totalSteps: number
}

export function BookingTopBar({ currentStep, totalSteps }: BookingTopBarProps) {
  const isFinalStep = currentStep === totalSteps

  return (
    <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/50">
      <div className="mx-auto flex max-w-[660px] items-center justify-between gap-4 px-4 py-3">
        {/* Logo mark + business name */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-[27px] shrink-0 items-center justify-center rounded-[6px] bg-primary">
            <BookOpen className="size-[14px] text-primary-foreground stroke-[2px]" />
          </div>
          <span className="font-heading font-bold text-[15px] leading-none">
            FlexBooking
          </span>
        </div>

        {/* Progress dots + step counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "inline-block rounded-full transition-all duration-300",
                  i + 1 === currentStep
                    ? "bg-primary size-2"
                    : "bg-muted size-1.5"
                )}
              />
            ))}
          </div>
          {!isFinalStep && (
            <span className="text-sm text-muted-foreground font-semibold tabular-nums">
              Step {currentStep} of {totalSteps}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
