"use client"

import { cn } from "@/lib/utils"
import type { AvailableSlotResponse } from "@/lib/api/availability"

interface SlotGridProps {
  slots: AvailableSlotResponse[]
  selectedSlot: string | null
  onSelect: (slotTime: string) => void
}

export function SlotGrid({ slots, selectedSlot, onSelect }: SlotGridProps) {
  if (slots.length === 0) return null

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
        Preferred time window
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {slots.map((slot) => (
          <button
            key={slot.slotTime}
            type="button"
            onClick={() => slot.isAvailable && onSelect(slot.slotTime)}
            className={cn(
              "bg-card ring-1 ring-foreground/10 rounded-xl p-3 flex flex-col gap-0.5 text-left cursor-pointer transition-all duration-150",
              selectedSlot === slot.slotTime && "ring-primary bg-primary-tint text-accent-foreground",
              !slot.isAvailable && "opacity-40 cursor-not-allowed pointer-events-none",
            )}
          >
            <span className="font-heading font-semibold text-sm leading-snug">
              {slot.displayLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {slot.slotTime}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
