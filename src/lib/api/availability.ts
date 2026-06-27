import { apiFetch } from '@/lib/api/client'
import type {
  AvailableSlotResponse,
  AvailableSlotsResponse,
  AvailableDatesResponse,
} from '@/lib/api/availability-types'

export type {
  AvailableSlotResponse,
  AvailableSlotsResponse,
  AvailableDatesResponse,
}
export { AVAILABILITY_WINDOW_DAYS } from '@/lib/api/availability-types'

/**
 * GET /v1/availability/dates?startDate=...&days=...
 * Returns dates that are available for booking within the given window.
 */
export async function getAvailableDates(
  startDate: string,
  days: number,
): Promise<AvailableDatesResponse> {
  return apiFetch<AvailableDatesResponse>(
    `/v1/availability/dates?startDate=${encodeURIComponent(startDate)}&days=${days}`,
  )
}

/**
 * GET /v1/availability/slots?date=...
 * Returns all time slots for the given date with their availability status.
 */
export async function getAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
  return apiFetch<AvailableSlotsResponse>(
    `/v1/availability/slots?date=${encodeURIComponent(date)}`,
  )
}
