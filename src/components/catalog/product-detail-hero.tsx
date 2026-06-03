import Link from "next/link"
import { Package, Clock, ChevronRight } from "lucide-react"
import type { ProductDetailResponse } from "@/lib/api/catalog"
import { ProductHeroControls } from "@/components/catalog/product-hero-controls"

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 h-7 rounded-full px-3 text-[13px] font-semibold whitespace-nowrap shrink-0"
      style={
        active
          ? { background: "var(--status-active-bg)", color: "var(--status-active-fg)" }
          : { background: "var(--status-inactive-bg)", color: "var(--status-inactive-fg)" }
      }
    >
      <span className="size-[7px] rounded-full bg-current" />
      {active ? "Active" : "Inactive"}
    </span>
  )
}

export function ProductDetailHero({ product }: { product: ProductDetailResponse }) {
  return (
    <div className="space-y-5">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground flex-wrap">
        <Link href="/dashboard/catalog/products" className="font-semibold hover:text-primary transition-colors">
          Products
        </Link>
        <ChevronRight className="size-3.5 opacity-50 shrink-0" />
        <span className="font-semibold text-foreground">{product.name}</span>
      </nav>

      {/* Product header */}
      <header className="flex gap-[18px] items-start">
        <div className="size-16 rounded-[18px] bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Package className="size-[30px]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-primary">Product</p>

          <div className="flex items-center gap-3 flex-wrap mt-1.5">
            <h1 className="font-heading text-[30px] sm:text-[36px] font-bold tracking-[-0.03em] leading-[1.04]">
              {product.name}
            </h1>
            <StatusPill active={product.active} />
          </div>

          <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed max-w-[660px]">
            {product.description}
          </p>

          {product.updatedAt && (
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4">
              <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Clock className="size-3.5 text-muted-foreground" />
                Updated <b className="font-semibold text-foreground/70">{product.updatedAt}</b>
              </span>
            </div>
          )}

          {/* Edit / delete controls — client leaf, hero stays a Server Component */}
          <div className="mt-5">
            <ProductHeroControls product={product} />
          </div>
        </div>
      </header>
    </div>
  )
}
