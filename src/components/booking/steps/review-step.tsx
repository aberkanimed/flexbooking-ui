import type { Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { StepHeading } from "@/components/booking/step-heading"
import { ClipboardCheck } from "lucide-react"

interface ReviewStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

export function ReviewStep({ state: _state, dispatch: _dispatch }: ReviewStepProps) {
  return (
    <>
      <StepHeading
        eyebrow="Review"
        title="Check your booking"
        help="Everything look right? Go back to edit any step."
      />
      <div className="bg-card ring-1 ring-foreground/10 rounded-3xl p-8 w-full max-w-[540px] mx-auto flex flex-col items-center gap-4 shadow-card">
        <div className="size-[50px] rounded-[15px] bg-primary-soft flex items-center justify-center">
          <ClipboardCheck className="size-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Booking summary coming soon
        </p>
      </div>
    </>
  )
}
