import type { LucideIcon } from "lucide-react"
import type { ServiceDetailResponse } from "@/lib/api/catalog"
import type { BookingResponse } from "@/lib/api/booking"

export interface ConfiguredItem {
  value: string | number
}

export interface BookingState {
  currentStep: number
  date: string | null
  slot: string | null
  email: string
  serviceId: string | null
  serviceDetail: ServiceDetailResponse | null
  configuredItems: Record<string, ConfiguredItem>
  bookingResult: BookingResponse | null
  submitErrors: string[]
}

export type BookingAction =
  | { type: "SET_DATE"; date: string }
  | { type: "SET_SLOT"; slot: string | null }
  | { type: "SET_EMAIL"; email: string }
  | { type: "SET_SERVICE"; serviceId: string }
  | { type: "SET_SERVICE_DETAIL"; payload: ServiceDetailResponse }
  | { type: "SET_ITEM"; key: string; value: string | number }
  | { type: "SET_BOOKING_RESULT"; booking: BookingResponse }
  | { type: "SET_SUBMIT_ERRORS"; errors: string[] }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GO_TO"; step: number }

export interface StepConfig {
  eyebrow: string
  title: string
  help: string
  icon: LucideIcon
}
