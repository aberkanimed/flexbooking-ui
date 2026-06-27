import type { Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { StepHeading } from "@/components/booking/step-heading"
import { CalendarDays } from "lucide-react"

interface DateTimeStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

export function DateTimeStep({ state: _state, dispatch: _dispatch }: DateTimeStepProps) {
  return (
    <>
      <StepHeading
        eyebrow="When"
        title="Pick a date and time"
        help="Choose a day that works for you and a preferred time window."
      />
      <div className="bg-card ring-1 ring-foreground/10 rounded-3xl p-8 w-full max-w-[540px] mx-auto flex flex-col items-center gap-4 shadow-card">
        <div className="size-[50px] rounded-[15px] bg-primary-soft flex items-center justify-center">
          <CalendarDays className="size-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Date and time picker coming soon
        </p>
      </div>
    </>
  )
}
