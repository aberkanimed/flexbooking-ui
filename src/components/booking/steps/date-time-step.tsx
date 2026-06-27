"use client"

import { useState, useEffect, useMemo, useCallback, type Dispatch } from "react"
import { addDays } from "date-fns"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import type { AvailableSlotResponse } from "@/lib/api/availability-types"
import { AVAILABILITY_WINDOW_DAYS } from "@/lib/api/availability-types"
import { StepHeading } from "@/components/booking/step-heading"
import { Calendar } from "@/components/ui/calendar"
import { SlotGrid } from "@/components/booking/slot-grid"
import { Skeleton } from "@/components/ui/skeleton"

interface DateTimeStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

/** Completed result for a dates fetch — null means fetch is in progress or not started. */
interface DatesFetchResult {
  dates: string[]
  error: boolean
}

/** Completed result for a slots fetch — keyed by date so stale results are ignored. */
interface SlotsFetchResult {
  forDate: string
  slots: AvailableSlotResponse[]
  error: boolean
}

/** Format a local Date as YYYY-MM-DD without UTC offset issues. */
function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Parse an ISO date string (YYYY-MM-DD) into a local Date at midnight. */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function DateTimeStep({ state, dispatch }: DateTimeStepProps) {
  // null = in-flight; non-null = settled result
  const [datesFetch, setDatesFetch] = useState<DatesFetchResult | null>(null)
  const [slotsFetch, setSlotsFetch] = useState<SlotsFetchResult | null>(null)

  // Fetch available dates on mount
  useEffect(() => {
    let cancelled = false
    const startDate = toIso(new Date())

    fetch(`/api/availability/dates?startDate=${encodeURIComponent(startDate)}&days=${AVAILABILITY_WINDOW_DAYS}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ availableDates: string[] }>
      })
      .then((data) => {
        if (!cancelled) setDatesFetch({ dates: data.availableDates, error: false })
      })
      .catch(() => {
        if (!cancelled) setDatesFetch({ dates: [], error: true })
      })

    return () => { cancelled = true }
  }, [])

  // Fetch slots when a date is selected; derived loading = date changed since last settled result
  useEffect(() => {
    if (!state.date) return

    const date = state.date
    let cancelled = false

    fetch(`/api/availability/slots?date=${encodeURIComponent(date)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ slots: AvailableSlotResponse[] }>
      })
      .then((data) => {
        if (!cancelled) setSlotsFetch({ forDate: date, slots: data.slots, error: false })
      })
      .catch(() => {
        if (!cancelled) setSlotsFetch({ forDate: date, slots: [], error: true })
      })

    return () => { cancelled = true }
  }, [state.date])

  // Derive display state
  const datesLoading = datesFetch === null
  const datesError = datesFetch?.error ?? false

  const availableDateSet = useMemo(
    () => new Set(datesFetch?.dates ?? []),
    [datesFetch]
  )

  const slotsLoading = !!state.date && slotsFetch?.forDate !== state.date
  const slotsError = !slotsLoading && (slotsFetch?.error ?? false)
  const slots = slotsLoading ? [] : (slotsFetch?.slots ?? [])

  const today = useMemo(() => new Date(), [])
  const maxDate = useMemo(() => addDays(today, AVAILABILITY_WINDOW_DAYS), [today])

  const isDisabled = useCallback(
    (date: Date) => !availableDateSet.has(toIso(date)),
    [availableDateSet]
  )

  return (
    <>
      <StepHeading
        eyebrow="When"
        title="Pick a date and time"
        help="Choose a day that works for you and a preferred time window."
      />

      <div className="w-full max-w-[540px] mx-auto flex flex-col gap-[22px]">
        {/* Calendar card */}
        <div className="bg-card border border-border rounded-[20px] p-5 shadow-card">
          {datesLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-7 w-40 mx-auto" />
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
            </div>
          ) : datesError ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Unable to load available dates. Please try again.
            </p>
          ) : (
            <Calendar
              mode="single"
              selected={state.date ? parseLocalDate(state.date) : undefined}
              onSelect={(d) => {
                if (!d) return
                const iso = toIso(d)
                dispatch({ type: "SET_DATE", date: iso })
                dispatch({ type: "SET_SLOT", slot: null })
              }}
              disabled={isDisabled}
              startMonth={today}
              endMonth={maxDate}
              showOutsideDays={false}
              className="p-0"
              classNames={{ root: "w-full" }}
            />
          )}
        </div>

        {/* Slots section — separate from the calendar card */}
        {state.date && (
          <div>
            {slotsLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-3.5 w-36" />
                <div className="grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[62px] rounded-xl" />
                  ))}
                </div>
              </div>
            ) : slotsError ? (
              <p className="text-sm text-muted-foreground">
                Unable to load time slots. Please try again.
              </p>
            ) : (
              <SlotGrid
                slots={slots}
                selectedSlot={state.slot}
                onSelect={(slotTime) => dispatch({ type: "SET_SLOT", slot: slotTime })}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}
