"use client"

import { useState, useTransition, type Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { StepHeading } from "@/components/booking/step-heading"
import { BookingEstimate } from "@/components/booking/booking-estimate"
import { Button } from "@/components/ui/button"
import { computeEstimate, buildConfiguredItemsPayload } from "@/lib/booking/pricing"
import { submitBookingAction } from "@/app/book/actions"

interface ReviewStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(slot: string): string {
  const [h, min] = slot.split(":").map(Number)
  return new Date(2000, 0, 1, h, min).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function ReviewStep({ state, dispatch }: ReviewStepProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const { date, slot, email, serviceDetail, configuredItems } = state
  const estimate = serviceDetail
    ? computeEstimate(serviceDetail, configuredItems)
    : null

  const whenLabel =
    date && slot ? `${formatDate(date)} · ${formatTime(slot)}` : "—"

  function handleConfirm() {
    if (!date || !slot || !serviceDetail) return
    setErrors([])
    startTransition(async () => {
      const result = await submitBookingAction({
        customerEmail: email,
        date,
        arrivalTime: slot,
        serviceName: serviceDetail.name,
        characteristics: buildConfiguredItemsPayload(serviceDetail, configuredItems),
      })
      if (result.ok) {
        dispatch({ type: "SET_BOOKING_RESULT", booking: result.booking })
        dispatch({ type: "NEXT" })
      } else {
        setErrors(result.errors)
      }
    })
  }

  return (
    <>
      <StepHeading
        eyebrow="Review"
        title="Check your booking"
        help="Everything look right? Go back to edit any step."
      />
      <div className="w-full max-w-[540px] mx-auto flex flex-col gap-[13px]">
        <SectionCard
          label="When"
          value={whenLabel}
          onEdit={() => dispatch({ type: "GO_TO", step: 1 })}
        />
        <SectionCard
          label="Who"
          value={email || "—"}
          onEdit={() => dispatch({ type: "GO_TO", step: 2 })}
        />
        {/* ponytail: display-only; address step does not exist yet, add when backend supports it */}
        <SectionCard label="Where" value="no address yet" />
        <SectionCard
          label="Service"
          value={serviceDetail?.name ?? "—"}
          onEdit={() => dispatch({ type: "GO_TO", step: 3 })}
        />
        {estimate && (
          <div className="bg-card border border-border rounded-[18px] px-[18px] py-4 shadow-card">
            <BookingEstimate
              lineItems={estimate.lineItems}
              totalCents={estimate.totalCents}
            />
          </div>
        )}

        {errors.length > 0 && (
          <div className="rounded-[18px] bg-destructive/10 px-[18px] py-3 flex flex-col gap-1">
            {errors.map((e, i) => (
              <p key={i} className="text-[13px] text-destructive">
                {e}
              </p>
            ))}
          </div>
        )}

        <Button
          className="w-full mt-2"
          disabled={isPending}
          onClick={handleConfirm}
        >
          {isPending ? "Confirming…" : "Confirm booking"}
        </Button>
      </div>
    </>
  )
}

function SectionCard({
  label,
  value,
  onEdit,
}: {
  label: string
  value: string
  onEdit?: () => void
}) {
  return (
    <div className="bg-card border border-border rounded-[18px] px-[18px] py-[15px] shadow-card">
      <div className="flex justify-between items-center mb-[5px] gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[12.5px] font-semibold text-primary bg-transparent border-0 cursor-pointer shrink-0"
          >
            Edit
          </button>
        )}
      </div>
      <div className="text-[14.5px] text-foreground leading-[1.5]">{value}</div>
    </div>
  )
}
