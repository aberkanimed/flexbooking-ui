import type { Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { usd } from "@/lib/booking/pricing"
import { CheckCircle2 } from "lucide-react"

interface ConfirmationStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-[9px] border-b border-border/40 last:border-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="font-heading font-bold text-[14.5px] tabular-nums text-foreground text-right max-w-[60%] break-all">
        {value}
      </span>
    </div>
  )
}

export function ConfirmationStep({ state }: ConfirmationStepProps) {
  const { bookingResult } = state

  if (!bookingResult) {
    return (
      <div className="text-center text-sm text-muted-foreground py-16">
        No booking found. Please start a new booking.
      </div>
    )
  }

  const { id, status, customer, date, arrivalTime, subtotal, total, services } = bookingResult
  const serviceName = services.map((s) => s.serviceName).join(", ") || "—"

  const rows = [
    { label: "Reference", value: id },
    { label: "Status", value: status },
    { label: "When", value: `${date} · ${arrivalTime}` },
    { label: "Email", value: customer.email },
    { label: "Service", value: serviceName },
    { label: "Subtotal", value: usd.format(subtotal / 100) },
    { label: "Total", value: usd.format(total / 100) },
  ]

  return (
    <div className="w-full max-w-[460px] mx-auto flex flex-col items-center text-center">
      {/* Success icon — circular, accent-tinted */}
      <div className="size-[66px] rounded-full bg-primary-soft text-primary flex items-center justify-center mb-[18px]">
        <CheckCircle2 className="size-[30px]" />
      </div>

      {/* Heading */}
      <h2 className="font-heading font-bold text-[27px] tracking-[-0.02em] text-foreground leading-none">
        You&apos;re booked
      </h2>

      {/* Confirmation line */}
      <p className="text-[14.5px] text-muted-foreground leading-[1.55] mt-[10px] max-w-[380px]">
        We&apos;ve emailed your confirmation to{" "}
        <span className="font-medium text-foreground">{customer.email}</span>.
      </p>

      {/* Rows card */}
      <div className="mt-5 w-full bg-card border border-border rounded-[18px] px-[18px] py-2 shadow-card text-left flex flex-col">
        {rows.map((r) => (
          <Row key={r.label} label={r.label} value={r.value} />
        ))}
      </div>
    </div>
  )
}
