import { Package, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductResponse } from "@/lib/api/catalog"

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-7 rounded-full px-3 text-[13px] font-semibold whitespace-nowrap shrink-0",
        active
          ? "bg-[var(--status-active-bg)] text-[var(--status-active-fg)]"
          : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-fg)]"
      )}
    >
      <span className="size-[7px] rounded-full bg-current" />
      {active ? "Active" : "Inactive"}
    </span>
  )
}

export function ProductCard({ product }: { product: ProductResponse }) {
  return (
    <div className="group flex flex-col gap-3.5 rounded-3xl border border-border bg-card p-[18px] shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-[160ms] hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] hover:border-primary-soft">
      {/* Icon thumbnail + status pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-[50px] shrink-0 items-center justify-center rounded-[15px] bg-primary-soft text-primary">
          <Package className="size-6" />
        </div>
        <StatusPill active={product.active} />
      </div>

      {/* Name + description */}
      <div>
        <h3 className="font-heading text-[17.5px] font-semibold leading-snug tracking-[-0.01em] text-card-foreground">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2.5 pt-0.5">
        <span className="text-[13px] font-semibold text-muted-foreground">Product</span>
        <ArrowUpRight className="size-[18px] text-muted-foreground" />
      </div>
    </div>
  )
}
