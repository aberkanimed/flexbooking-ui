/** Number of days forward to request when fetching available dates (2-month window). */
export const AVAILABILITY_WINDOW_DAYS = 60

export interface AvailableSlotResponse {
  slotTime: string
  displayLabel: string
  isAvailable: boolean
}

export interface AvailableSlotsResponse {
  slots: AvailableSlotResponse[]
}

export interface AvailableDatesResponse {
  availableDates: string[]
}
