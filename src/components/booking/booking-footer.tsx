"use client"

import { useState } from "react"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BookingEstimate } from "@/components/booking/booking-estimate"
import { usd } from "@/lib/booking/pricing"

interface BookingFooterProps {
  canGoBack: boolean
  canContinue: boolean
  onBack: () => void
  onContinue: () => void
  hidden?: boolean
  estimate?: { lineItems: { label: string; amountCents: number }[]; totalCents: number }
}

export function BookingFooter({
  canGoBack,
  canContinue,
  onBack,
  onContinue,
  hidden = false,
  estimate,
}: BookingFooterProps) {
  const [open, setOpen] = useState(false)

  if (hidden) return null

  return (
    <footer className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-border/50">
      <div className="mx-auto flex max-w-[660px] items-center gap-3 px-4 py-3">
        {canGoBack && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}

        <div className="flex-1" />

        {estimate && (
          <div className="relative">
            {open && (
              <div className="absolute bottom-[calc(100%+12px)] right-0 w-[300px] bg-card border border-border rounded-[18px] shadow-pop p-[16px_18px]">
                <BookingEstimate
                  lineItems={estimate.lineItems}
                  totalCents={estimate.totalCents}
                />
              </div>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-[13px] bg-card border border-border rounded-full py-2 pl-4 pr-2 shadow-card cursor-pointer"
            >
              <span className="text-xs font-semibold text-muted-foreground">Estimate</span>
              <span className="font-heading font-bold text-[17px] tabular-nums tracking-[-0.01em] text-foreground">
                {usd.format(estimate.totalCents / 100)}
              </span>
              <span className="size-7 rounded-full bg-muted grid place-items-center text-muted-foreground">
                <ChevronUp
                  className={cn(
                    "size-[14px] transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </span>
            </button>
          </div>
        )}

        <Button
          onClick={onContinue}
          disabled={!canContinue}
          className="rounded-full shadow-cta h-[46px] px-6"
        >
          Continue
        </Button>
      </div>
    </footer>
  )
}
