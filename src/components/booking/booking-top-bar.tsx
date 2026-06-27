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
      <div className="mx-auto grid max-w-[660px] grid-cols-3 items-center h-[60px] px-4 lg:h-[68px] lg:px-8">
        {/* col 1 — Logo mark + business name (left-aligned) */}
        <div className="flex items-center gap-2.5">
          <FlexBookingLogoMark size={32} className="shrink-0" />
          <span className="font-heading text-[19px] font-bold tracking-[-0.02em]">
            Flex<span className="text-primary">Booking</span>
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
