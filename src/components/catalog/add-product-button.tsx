"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductFormSheet } from "@/components/catalog/product-form-sheet"

export function AddProductButton() {
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
        Add a product
      </button>

      {/* FAB — mobile only (below sm), positioned above the bottom nav */}
      <button
        type="button"
        aria-label="Add a product"
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

      <ProductFormSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
