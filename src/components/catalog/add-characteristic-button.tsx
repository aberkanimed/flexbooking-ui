"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { CharacteristicFormSheet } from "@/components/catalog/characteristic-form-sheet"

export function AddCharacteristicButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Header CTA — desktop only (sm+) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden sm:inline-flex items-center gap-2 h-[46px] shrink-0 rounded-full px-5",
          "bg-primary text-primary-foreground font-semibold text-[15px]",
          "shadow-[var(--shadow-cta)] hover:bg-primary-deep transition-colors duration-150 whitespace-nowrap"
        )}
      >
        <Plus className="size-[18px]" />
        Add an item
      </button>

      {/* FAB — mobile only (below sm), positioned above the bottom nav */}
      <button
        type="button"
        aria-label="Add an item"
        onClick={() => setOpen(true)}
        className={cn(
          "sm:hidden fixed bottom-20 right-4 z-30",
          "size-14 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-[var(--shadow-cta)] hover:bg-primary-deep",
          "flex items-center justify-center",
          "transition-colors duration-150 active:scale-95"
        )}
      >
        <Plus className="size-6" />
      </button>

      <CharacteristicFormSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
