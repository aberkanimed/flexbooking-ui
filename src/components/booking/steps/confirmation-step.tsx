import type { Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { StepHeading } from "@/components/booking/step-heading"
import { CheckCircle } from "lucide-react"

interface ConfirmationStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

export function ConfirmationStep({ state: _state, dispatch: _dispatch }: ConfirmationStepProps) {
  return (
    <>
      <StepHeading
        eyebrow="Done"
        title="Booking confirmed"
        help="You will receive a confirmation email shortly."
      />
      <div className="bg-card ring-1 ring-foreground/10 rounded-3xl p-8 w-full max-w-[540px] mx-auto flex flex-col items-center gap-4 shadow-card">
        <div className="size-[50px] rounded-[15px] bg-primary-soft flex items-center justify-center">
          <CheckCircle className="size-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Confirmation details coming soon
        </p>
      </div>
    </>
  )
}
