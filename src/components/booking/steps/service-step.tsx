"use client"

import { useState, useEffect, type Dispatch } from "react"
import { Wrench } from "lucide-react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import type { ServiceResponse } from "@/lib/api/catalog"
import { StepHeading } from "@/components/booking/step-heading"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ServiceStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function ServiceStep({ state, dispatch }: ServiceStepProps) {
  const [services, setServices] = useState<ServiceResponse[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch("/api/catalog/services")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ services: ServiceResponse[] }>
      })
      .then((data) => {
        if (!cancelled) setServices(data.services)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => { cancelled = true }
  }, [])

  const loading = services === null && !error

  return (
    <>
      <StepHeading
        eyebrow="What"
        title="Choose a service"
        help="Pick one service from the catalog."
      />

      <div className="w-full max-w-[540px] mx-auto flex flex-col gap-3">
        {loading && (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[130px] rounded-3xl" />
          ))
        )}

        {error && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Unable to load services. Please try again.
          </p>
        )}

        {!loading && !error && services!.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No services are available right now.</p>
            <p className="text-sm text-muted-foreground">Check back later or contact support.</p>
          </div>
        )}

        {!loading && !error && services!.map((service) => {
          const selected = state.serviceId === service.id
          return (
            <button
              key={service.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => dispatch({ type: "SET_SERVICE", serviceId: service.id })}
              className={cn(
                "flex flex-col gap-3.5 overflow-hidden rounded-3xl border border-border bg-card p-[18px] shadow-[var(--shadow-card)] text-left cursor-pointer transition-all duration-150 ring-2 ring-transparent focus-visible:outline-none focus-visible:ring-primary",
                selected && "ring-primary bg-primary-tint border-primary-soft",
              )}
            >
              {/* Icon */}
              <div className="flex size-[50px] shrink-0 items-center justify-center rounded-[15px] bg-primary-soft text-primary">
                <Wrench className="size-6" />
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

              {/* Price strip */}
              <div className="mt-auto flex items-center gap-2.5 bg-muted/50 -mx-[18px] -mb-[18px] px-[18px] py-3">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    Base price
                  </span>
                  <span className="font-heading text-base font-bold tabular-nums tracking-[-0.01em]">
                    {usd.format(service.basePrice / 100)}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
