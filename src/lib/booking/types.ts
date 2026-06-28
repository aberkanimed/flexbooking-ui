import type { LucideIcon } from "lucide-react"

export interface BookingState {
  currentStep: number
  date: string | null
  slot: string | null
  email: string
  serviceId: string | null
  configuredItems: Record<string, unknown>
}

export type BookingAction =
  | { type: "SET_DATE"; date: string }
  | { type: "SET_SLOT"; slot: string | null }
  | { type: "SET_EMAIL"; email: string }
  | { type: "SET_SERVICE"; serviceId: string }
  | { type: "SET_ITEM"; key: string; value: unknown }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GO_TO"; step: number }

export interface StepConfig {
  eyebrow: string
  title: string
  help: string
  icon: LucideIcon
}
