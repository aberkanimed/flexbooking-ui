"use client"

import { useState, useCallback } from "react"
import { Layers, ChevronDown, Check, SlidersHorizontal, ListTree, Type, Hash, ToggleLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ServiceDetailResponse, CharacteristicSpecificationDetailResponse } from "@/lib/api/catalog"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })
const money = (cents: number) => usd.format(cents / 100)

const UNIT_SUFFIX: Record<string, string> = {
  UNIT: "unit",
  SQUARE_FOOTAGE: "sq ft",
  HOUR: "hr",
  MINUTE: "min",
  NONE: "",
}

const VALUE_TYPE_META = {
  STRING: { label: "Text", Icon: Type },
  NUMBER: { label: "Number", Icon: Hash },
  BOOLEAN: { label: "Yes · no", Icon: ToggleLeft },
}

function StatusPill({ active, sm }: { active: boolean; sm?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap shrink-0",
        sm ? "h-6 px-2.5 text-[12px]" : "h-7 px-3 text-[13px]"
      )}
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

function VTypeBadge({ type }: { type: "STRING" | "NUMBER" | "BOOLEAN" }) {
  const meta = VALUE_TYPE_META[type] ?? VALUE_TYPE_META.STRING
  return (
    <span className="inline-flex items-center gap-1 h-[22px] px-2.5 rounded-full bg-muted border border-border text-[11.5px] font-semibold text-muted-foreground whitespace-nowrap">
      <meta.Icon className="size-3 text-muted-foreground" />
      {meta.label}
    </span>
  )
}

function CharConfig({ spec }: { spec: CharacteristicSpecificationDetailResponse }) {
  if (spec.range) {
    const unit = UNIT_SUFFIX[spec.unitOfMeasure] ?? ""
    return (
      <span className="inline-flex items-center gap-2">
        <span className="font-heading font-bold text-[14px] tabular-nums px-2.5 py-0.5 rounded-[9px] bg-muted border border-border text-foreground">
          {spec.valueFrom?.toLocaleString()}
        </span>
        <span className="w-11 h-[3px] rounded-full bg-gradient-to-r from-primary-soft to-primary shrink-0" />
        <span className="font-heading font-bold text-[14px] tabular-nums px-2.5 py-0.5 rounded-[9px] bg-muted border border-border text-foreground">
          {spec.valueTo?.toLocaleString()}
        </span>
        {unit && <span className="text-[12.5px] text-muted-foreground font-semibold">{unit}</span>}
      </span>
    )
  }
  if (spec.values && spec.values.length > 0) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {spec.values.map((v, i) => (
          <span
            key={i}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[12.5px] font-semibold",
              v.isDefault
                ? "border-[var(--status-active-bg)] bg-[var(--status-active-bg)] text-[var(--status-active-fg)]"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            {v.isDefault && <Check className="size-3 text-[var(--status-active-fg)]" />}
            {v.value}
          </span>
        ))}
      </div>
    )
  }
  return <span className="text-[13px] text-muted-foreground font-semibold">—</span>
}

function Addon({ spec }: { spec: CharacteristicSpecificationDetailResponse }) {
  if (!spec.price) {
    return (
      <span className="text-[13px] font-semibold" style={{ color: "var(--status-active-fg)" }}>
        Included
      </span>
    )
  }
  const unit = UNIT_SUFFIX[spec.unitOfMeasure] ?? ""
  const per = unit ? `/ ${unit}` : ""
  return (
    <span className="font-heading font-bold text-[14px] tabular-nums tracking-[-0.01em] text-foreground">
      +{money(spec.price)}{" "}
      {per && <span className="font-sans text-[11.5px] font-semibold text-muted-foreground tracking-normal">{per}</span>}
    </span>
  )
}

function CharCards({ specs }: { specs: CharacteristicSpecificationDetailResponse[] }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))" }}>
      {specs.map((spec) => (
        <div
          key={spec.id}
          className="flex flex-col gap-2.5 rounded-2xl border border-border bg-background p-[15px_15px_14px]"
        >
          <div className="flex items-start justify-between gap-2.5">
            <span className="text-[14.5px] font-semibold text-foreground leading-snug">
              {spec.characteristic.name}
            </span>
            <VTypeBadge type={spec.characteristic.valueType} />
          </div>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">
            {spec.characteristic.description}
          </p>
          <CharConfig spec={spec} />
          <div className="flex items-center justify-between gap-2.5 mt-auto pt-2.5 border-t border-border">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              {spec.configurable ? (
                <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full bg-primary-tint text-accent-foreground text-[11.5px] font-bold">
                  <SlidersHorizontal className="size-[11px]" />
                  Configurable
                </span>
              ) : (
                "Fixed"
              )}
            </span>
            <Addon spec={spec} />
          </div>
        </div>
      ))}
    </div>
  )
}

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
