import Link from "next/link"
import { Wrench, ArrowUpRight } from "lucide-react"
import type { ServiceResponse } from "@/lib/api/catalog"
import { StatusPill } from "@/components/catalog/status-pill"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export function ServiceCard({ service }: { service: ServiceResponse }) {
  return (
    <Link href={`/dashboard/catalog/services/${service.id}`} className="group flex flex-col gap-3.5 overflow-hidden rounded-3xl border border-border bg-card p-[18px] shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-[160ms] hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] hover:border-primary-soft">
      {/* Icon thumbnail + status pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-[50px] shrink-0 items-center justify-center rounded-[15px] bg-primary-soft text-primary">
          <Wrench className="size-6" />
        </div>
        <StatusPill active={service.active} />
      </div>

      {/* Name + description */}
      <div>
        <h3 className="font-heading text-[17.5px] font-semibold leading-snug tracking-[-0.01em] text-card-foreground">
          {service.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {service.description}
        </p>
      </div>

      {/* Footer — price strip */}
      <div className="mt-auto flex items-center justify-between gap-2.5 bg-muted/50 -mx-[18px] -mb-[18px] px-[18px] py-3">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Base price
          </span>
          <span className="font-heading text-base font-bold tabular-nums tracking-[-0.01em]">
            {usd.format(service.basePrice / 100)}
          </span>
        </div>
        <ArrowUpRight className="size-[18px] text-muted-foreground" />
      </div>
    </Link>
  )
}
