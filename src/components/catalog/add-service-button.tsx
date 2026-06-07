"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductResponse } from "@/lib/api/catalog"
import { ServiceFormSheet } from "@/components/catalog/service-form-sheet"

interface AddServiceButtonProps {
  products: ProductResponse[]
}

export function AddServiceButton({ products }: AddServiceButtonProps) {
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
        Add a service
      </button>

      {/* FAB — mobile only (below sm), positioned above the bottom nav */}
      <button
        type="button"
        aria-label="Add a service"
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

      <ServiceFormSheet open={open} onOpenChange={setOpen} products={products} />
    </>
  )
}
