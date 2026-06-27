import type { Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { StepHeading } from "@/components/booking/step-heading"
import { Layers } from "lucide-react"

interface ServiceStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

export function ServiceStep({ state: _state, dispatch: _dispatch }: ServiceStepProps) {
  return (
    <>
      <StepHeading
        eyebrow="What"
        title="Choose a service"
        help="Pick one service from the catalog."
      />
      <div className="bg-card ring-1 ring-foreground/10 rounded-3xl p-8 w-full max-w-[540px] mx-auto flex flex-col items-center gap-4 shadow-card">
        <div className="size-[50px] rounded-[15px] bg-primary-soft flex items-center justify-center">
          <Layers className="size-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Service catalog coming soon
        </p>
      </div>
    </>
  )
}
