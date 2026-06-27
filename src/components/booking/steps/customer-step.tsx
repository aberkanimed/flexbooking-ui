import type { Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { StepHeading } from "@/components/booking/step-heading"
import { User } from "lucide-react"

interface CustomerStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

export function CustomerStep({ state: _state, dispatch: _dispatch }: CustomerStepProps) {
  return (
    <>
      <StepHeading
        eyebrow="Who"
        title="Your details"
        help="We just need your email to send a confirmation."
      />
      <div className="bg-card ring-1 ring-foreground/10 rounded-3xl p-8 w-full max-w-[540px] mx-auto flex flex-col items-center gap-4 shadow-card">
        <div className="size-[50px] rounded-[15px] bg-primary-soft flex items-center justify-center">
          <User className="size-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Contact details form coming soon
        </p>
      </div>
    </>
  )
}
