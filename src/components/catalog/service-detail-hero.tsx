import Link from "next/link"
import { Layers, ChevronRight } from "lucide-react"
import type { ServiceDetailResponse } from "@/lib/api/catalog"
import { StatusPill } from "@/components/catalog/status-pill"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })
const money = (cents: number) => usd.format(cents / 100)

export function ServiceDetailHero({ service }: { service: ServiceDetailResponse }) {
  return (
    <div className="space-y-5">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground flex-wrap">
        <Link href="/dashboard/catalog/services" className="font-semibold hover:text-primary transition-colors">
          Services
        </Link>
        <ChevronRight className="size-3.5 opacity-50 shrink-0" />
        <span className="font-semibold text-foreground">{service.name}</span>
      </nav>

      {/* Service header */}
      <header className="flex gap-[18px] items-start">
        <div className="size-16 rounded-[18px] bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Layers className="size-[30px]" />
        </div>

        <div className="flex-1 min-w-0 flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-primary">Service</p>

            <div className="flex items-center gap-3 flex-wrap mt-1.5">
              <h1 className="font-heading text-[30px] sm:text-[36px] font-bold tracking-[-0.03em] leading-[1.04]">
                {service.name}
              </h1>
              <StatusPill active={service.active} />
            </div>

            <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed max-w-[560px]">
              {service.description}
            </p>
          </div>

          {/* Base price — right-aligned, hidden on small screens */}
          <div className="hidden sm:block shrink-0 text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Base price</p>
            <p className="font-heading text-[28px] font-bold tracking-[-0.02em] tabular-nums mt-1">
              {money(service.basePrice)}
            </p>
          </div>
        </div>
      </header>

      {/* Base price — shown below on mobile */}
      <div className="sm:hidden">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Base price</p>
        <p className="font-heading text-[24px] font-bold tracking-[-0.02em] tabular-nums mt-0.5">
          {money(service.basePrice)}
        </p>
      </div>
    </div>
  )
}
