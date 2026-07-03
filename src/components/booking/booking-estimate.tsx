import { usd } from "@/lib/booking/pricing"

export interface BookingEstimateProps {
  lineItems: { label: string; amountCents: number }[]
  totalCents: number
}

export function BookingEstimate({ lineItems, totalCents }: BookingEstimateProps) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3">
        Your estimate
      </p>
      <div className="flex flex-col gap-[9px]">
        {lineItems.map((item, i) => (
          <div key={i} className="flex justify-between gap-3 text-[13px]">
            <span className="text-foreground">{item.label}</span>
            <span className="tabular-nums font-semibold">{usd.format(item.amountCents / 100)}</span>
          </div>
        ))}
      </div>
      <div className="h-px bg-border my-3" />
      <div className="flex justify-between items-baseline">
        <span className="font-bold text-[13px]">Estimated total</span>
        <span className="font-heading font-bold text-[18px] tabular-nums">
          {usd.format(totalCents / 100)}
        </span>
      </div>
    </>
  )
}
