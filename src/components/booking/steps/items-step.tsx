import type { Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { StepHeading } from "@/components/booking/step-heading"
import { SlidersHorizontal } from "lucide-react"

interface ItemsStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

export function ItemsStep({ state: _state, dispatch: _dispatch }: ItemsStepProps) {
  return (
    <>
      <StepHeading
        eyebrow="Configure"
        title="Customize your service"
        help="Adjust the options for your chosen service."
      />
      <div className="bg-card ring-1 ring-foreground/10 rounded-3xl p-8 w-full max-w-[540px] mx-auto flex flex-col items-center gap-4 shadow-card">
        <div className="size-[50px] rounded-[15px] bg-primary-soft flex items-center justify-center">
          <SlidersHorizontal className="size-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Service configuration coming soon
        </p>
      </div>
    </>
  )
}
