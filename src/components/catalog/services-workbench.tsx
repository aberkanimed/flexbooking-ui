"use client"

import { useState, useCallback } from "react"
import { Layers, ChevronDown, ListTree } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ServiceDetailResponse } from "@/lib/api/catalog"
import { CharCards } from "./char-cards"
import { StatusPill } from "@/components/catalog/status-pill"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })
const money = (cents: number) => usd.format(cents / 100)

function ServiceItem({
  svc,
  open,
  onToggle,
}: {
  svc: ServiceDetailResponse
  open: boolean
  onToggle: () => void
}) {
  const n = svc.characteristics.length
  return (
    <div
      id={`svc-${svc.id}`}
      className={cn(
        "bg-card border rounded-[22px] shadow-[var(--shadow-card)] overflow-hidden transition-[border-color,box-shadow] duration-[160ms]",
        open ? "border-primary-soft shadow-[var(--shadow-pop)]" : "border-border"
      )}
    >
      <button
        className="w-full text-left flex items-center gap-4 px-5 py-[18px] hover:bg-primary/[0.022] transition-colors"
        onClick={onToggle}
        aria-expanded={open}
      >
        {/* Icon thumb */}
        <span className="size-[46px] rounded-[14px] bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Layers className="size-[22px]" />
        </span>

        {/* Name + description */}
        <span className="flex-1 min-w-0">
          <span className="font-heading text-[18px] font-semibold tracking-[-0.01em] flex items-center gap-2.5 flex-wrap">
            {svc.name}
            <StatusPill active={svc.active} sm />
          </span>
          <span className="text-[13.5px] text-muted-foreground leading-snug mt-1 block max-w-[560px]">
            {svc.description}
          </span>
        </span>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "size-5 text-muted-foreground shrink-0 transition-transform duration-[280ms]",
            open && "rotate-180"
          )}
          style={{ transitionTimingFunction: "cubic-bezier(.22,1,.36,1)" }}
        />

        {/* Count + price */}
        <span className="flex items-center gap-[18px] shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground">
            <ListTree className="size-[15px]" />
            {n} {n === 1 ? "item" : "items"}
          </span>
          <span className="text-right">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground block">
              Base
            </span>
            <span className="font-heading text-[18px] font-bold tracking-[-0.01em] tabular-nums">
              {money(svc.basePrice)}
            </span>
          </span>
        </span>
      </button>

      {/* Accordion body */}
      <div
        className="grid transition-[grid-template-rows] duration-300"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-[22px] pt-1 border-t border-border/60">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground py-4">
              Items
            </p>
            {n === 0 ? (
              <p className="text-[13.5px] text-muted-foreground py-2">
                No items defined for this service yet.
              </p>
            ) : (
              <CharCards specs={svc.characteristics} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ServicesWorkbench({ services }: { services: ServiceDetailResponse[] }) {
  const [openIds, setOpenIds] = useState<string[]>(
    services.length > 0 ? [services[0].id] : []
  )

  const toggle = useCallback((id: string) => {
    setOpenIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    )
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em]">Related services</h2>
        <p className="text-[13.5px] text-muted-foreground mt-1">
          Services that bill, schedule and configure under this product.
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {services.map((svc) => (
          <ServiceItem
            key={svc.id}
            svc={svc}
            open={openIds.includes(svc.id)}
            onToggle={() => toggle(svc.id)}
          />
        ))}
        {services.length === 0 && (
          <p className="text-[13.5px] text-muted-foreground py-4">No services linked to this product yet.</p>
        )}
      </div>
    </div>
  )
}
