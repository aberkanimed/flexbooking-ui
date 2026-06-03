"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { ProductFormSheet } from "@/components/catalog/product-form-sheet"

export function AddProductButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-2 h-[46px] shrink-0 rounded-full px-5 bg-primary text-primary-foreground font-semibold text-[15px] shadow-[var(--shadow-cta)] hover:bg-primary-deep transition-colors duration-150 whitespace-nowrap"
      >
        <Plus className="size-[18px]" />
        Add a product
      </button>
      <ProductFormSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
