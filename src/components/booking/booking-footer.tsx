"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BookingFooterProps {
  canGoBack: boolean
  canContinue: boolean
  onBack: () => void
  onContinue: () => void
  hidden?: boolean
}

export function BookingFooter({
  canGoBack,
  canContinue,
  onBack,
  onContinue,
  hidden = false,
}: BookingFooterProps) {
  if (hidden) return null

  return (
    <footer className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-border/50">
      <div
        className={cn(
          "mx-auto flex max-w-[660px] items-center px-4 py-3",
          canGoBack ? "justify-between" : "justify-end"
        )}
      >
        {canGoBack && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
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
