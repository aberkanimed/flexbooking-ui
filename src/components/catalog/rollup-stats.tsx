import type { ServiceDetailResponse } from "@/lib/api/catalog"
import { StatusPill } from "@/components/catalog/status-pill"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })
const money = (cents: number) => usd.format(cents / 100)

interface RollupStatsProps {
  services: ServiceDetailResponse[]
  productActive: boolean
}

export function RollupStats({ services, productActive }: RollupStatsProps) {
  const activeCount = services.filter((s) => s.active).length
  const inactiveCount = services.length - activeCount
  const prices = services.map((s) => s.basePrice)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const totalChars = services.reduce((a, s) => a + s.characteristics.length, 0)
  const configurableChars = services.reduce(
    (a, s) => a + s.characteristics.filter((c) => c.configurable).length,
    0
  )

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-3 my-6">
      {/* Services */}
      <div className="rounded-[22px] bg-card ring-1 ring-foreground/10 p-[16px_18px] shadow-[var(--shadow-card)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Services</p>
        <p className="font-heading text-[26px] font-bold tracking-[-0.02em] tabular-nums mt-2">
          {services.length}
        </p>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">
          {activeCount} active · {inactiveCount} inactive
        </p>
      </div>

      {/* Base price range */}
      <div className="rounded-[22px] bg-card ring-1 ring-foreground/10 p-[16px_18px] shadow-[var(--shadow-card)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Base price range</p>
        <p className="font-heading text-[26px] font-bold tracking-[-0.02em] tabular-nums mt-2 flex items-baseline gap-1.5">
          {money(minPrice)}
          {minPrice !== maxPrice && (
            <span className="text-sm text-muted-foreground font-semibold tracking-normal">
              – {money(maxPrice)}
            </span>
          )}
        </p>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">across all services</p>
      </div>

      {/* Items */}
      <div className="rounded-[22px] bg-card ring-1 ring-foreground/10 p-[16px_18px] shadow-[var(--shadow-card)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Items</p>
        <p className="font-heading text-[26px] font-bold tracking-[-0.02em] tabular-nums mt-2">
          {totalChars}
        </p>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">{configurableChars} configurable</p>
      </div>

      {/* Status */}
      <div className="rounded-[22px] bg-card ring-1 ring-foreground/10 p-[16px_18px] shadow-[var(--shadow-card)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Status</p>
        <div className="mt-2">
          <StatusPill active={productActive} />
        </div>
        <p className="text-[12.5px] text-muted-foreground mt-1.5">
          {productActive ? "live in your catalog" : "not published"}
        </p>
      </div>
    </div>
  )
}
