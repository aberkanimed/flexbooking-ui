import { cn } from "@/lib/utils"
import { FlexBookingLogoMark } from "@/components/ui/flex-booking-logo"

interface BookingTopBarProps {
  currentStep: number
  totalSteps: number
}

export function BookingTopBar({ currentStep, totalSteps }: BookingTopBarProps) {
  const isFinalStep = currentStep === totalSteps

  return (
    <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/50">
      <div className="mx-auto grid max-w-[660px] grid-cols-3 items-center px-4 py-3">
        {/* col 1 — Logo mark + business name (left-aligned) */}
        <div className="flex items-center gap-2.5">
          <FlexBookingLogoMark size={27} className="shrink-0" />
          <span className="font-heading font-bold text-[15px] leading-none">
            FlexBooking
          </span>
        </div>

        {/* col 2 — Progress dots (center-aligned) */}
        <div className="flex items-center justify-center gap-1.5">
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

        {/* col 3 — Step counter (right-aligned) */}
        <div className="flex justify-end">
          {!isFinalStep && (
            <span className="text-[12.5px] text-muted-foreground font-semibold tabular-nums">
              Step {currentStep} of {totalSteps}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
