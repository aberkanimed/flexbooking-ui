"use client"

import { useState, useEffect, type Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import type {
  CharacteristicSpecificationDetailResponse,
  ServiceDetailResponse,
} from "@/lib/api/catalog"
import { StepHeading } from "@/components/booking/step-heading"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isSpecVisible, seedDefaults, usd } from "@/lib/booking/pricing"

interface ItemsStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

const numFmt = new Intl.NumberFormat("en-US")

function unitSuffix(
  unit: CharacteristicSpecificationDetailResponse["unitOfMeasure"],
): string {
  if (unit === "SQUARE_FOOTAGE") return " sq ft"
  if (unit === "HOUR") return " hr"
  if (unit === "MINUTE") return " min"
  return ""
}

export function ItemsStep({ state, dispatch }: ItemsStepProps) {
  // Track which serviceId caused a fetch error so it auto-clears on service change
  const [errorForServiceId, setErrorForServiceId] = useState<string | null>(null)

  const detailLoaded = state.serviceDetail?.id === state.serviceId
  const error = errorForServiceId === state.serviceId
  const loading = !!state.serviceId && !detailLoaded && !error

  useEffect(() => {
    if (!state.serviceId || detailLoaded) return

    let cancelled = false

    fetch(`/api/catalog/services/${state.serviceId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ServiceDetailResponse>
      })
      .then((detail) => {
        if (cancelled) return
        dispatch({ type: "SET_SERVICE_DETAIL", payload: detail })
        const defaults = seedDefaults(detail)
        for (const [key, item] of Object.entries(defaults)) {
          dispatch({ type: "SET_ITEM", key, value: item.value })
        }
      })
      .catch(() => {
        if (!cancelled) setErrorForServiceId(state.serviceId)
      })

    return () => {
      cancelled = true
    }
  }, [state.serviceId, detailLoaded, dispatch])

  const { serviceDetail, configuredItems } = state

  const visibleSpecs = serviceDetail
    ? serviceDetail.characteristics.filter(
        (s) => s.active && isSpecVisible(s, configuredItems),
      )
    : []

  return (
    <>
      <StepHeading
        eyebrow="Configure"
        title="Customize your service"
        help="Adjust the options for your chosen service."
      />

      <div className="w-full max-w-[560px] mx-auto flex flex-col gap-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[58px] rounded-2xl" />
          ))}

        {error && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Unable to load service options. Please try again.
          </p>
        )}

        {!loading && !error && visibleSpecs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No options to configure for this service.
          </p>
        )}

        {!loading &&
          !error &&
          visibleSpecs.map((spec) => {
            const name = spec.characteristic.name
            const desc = spec.characteristic.description
            const currentValue = configuredItems[spec.id]?.value
            const cardClass =
              "flex items-center gap-4 bg-card border border-border rounded-2xl px-[18px] py-[14px] shadow-[var(--shadow-card)]"

            // boolean → Switch (configurable) or read-only
            if (spec.characteristic.valueType === "BOOLEAN") {
              const checked = currentValue === "true"
              return (
                <div key={spec.id} className={cardClass}>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-[15px] text-foreground">
                      {name}
                    </div>
                    {desc && (
                      <div className="text-[12.5px] text-muted-foreground mt-0.5">
                        {desc}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {usd.format(spec.price / 100)}
                    </div>
                  </div>
                  <div className="flex-none">
                    {spec.configurable ? (
                      <Switch
                        checked={checked}
                        onCheckedChange={(c) =>
                          dispatch({
                            type: "SET_ITEM",
                            key: spec.id,
                            value: c ? "true" : "false",
                          })
                        }
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {checked ? "Yes" : "No"}
                      </span>
                    )}
                  </div>
                </div>
              )
            }

            // number + range → slider (configurable) or read-only
            if (spec.characteristic.valueType === "NUMBER" && spec.range) {
              const numVal = Number(currentValue ?? spec.valueFrom ?? 0)
              const rateUnit = unitSuffix(spec.unitOfMeasure).trim()
              return (
                <div key={spec.id} className={cardClass}>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-[15px] text-foreground">
                      {name}
                    </div>
                    {desc && (
                      <div className="text-[12.5px] text-muted-foreground mt-0.5">
                        {desc}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {usd.format(spec.price / 100)}{rateUnit ? ` / ${rateUnit}` : ""}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 w-[200px] flex-none">
                    <span className="font-heading font-bold text-[14px] tabular-nums">
                      {numFmt.format(numVal)}
                      {unitSuffix(spec.unitOfMeasure)}
                    </span>
                    {spec.configurable ? (
                      <input
                        type="range"
                        min={spec.valueFrom ?? 0}
                        max={spec.valueTo ?? 100}
                        value={numVal}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_ITEM",
                            key: spec.id,
                            value: Number(e.target.value),
                          })
                        }
                        className="w-full accent-primary cursor-pointer"
                      />
                    ) : null}
                  </div>
                </div>
              )
            }

            // string / value-set → Select (configurable) or read-only
            if (
              spec.characteristic.valueType === "STRING" ||
              spec.values.length > 0
            ) {
              const strVal = String(
                currentValue ??
                  spec.values.find((v) => v.isDefault)?.value ??
                  spec.values[0]?.value ??
                  "",
              )
              return (
                <div key={spec.id} className={cardClass}>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-[15px] text-foreground">
                      {name}
                    </div>
                    {desc && (
                      <div className="text-[12.5px] text-muted-foreground mt-0.5">
                        {desc}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {usd.format(spec.price / 100)}
                    </div>
                  </div>
                  <div className="flex-none">
                    {spec.configurable ? (
                      <Select
                        value={strVal}
                        onValueChange={(v) =>
                          dispatch({
                            type: "SET_ITEM",
                            key: spec.id,
                            value: v ?? "",
                          })
                        }
                      >
                        <SelectTrigger className="min-w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {spec.values.map((v) => (
                              <SelectItem key={v.id} value={v.value}>
                                {v.value}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {strVal}
                      </span>
                    )}
                  </div>
                </div>
              )
            }

            // non-configurable fallback: read-only display
            return (
              <div key={spec.id} className={cardClass}>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-semibold text-[15px] text-foreground">
                    {name}
                  </div>
                  {desc && (
                    <div className="text-[12.5px] text-muted-foreground mt-0.5">
                      {desc}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {usd.format(spec.price / 100)}
                  </div>
                </div>
                <div className="flex-none">
                  <span className="text-sm text-muted-foreground">
                    {currentValue !== undefined ? String(currentValue) : "—"}
                  </span>
                </div>
              </div>
            )
          })}
      </div>
    </>
  )
}
