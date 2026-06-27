"use client"

import { useReducer } from "react"
import {
  CalendarDays,
  User,
  Layers,
  SlidersHorizontal,
  ClipboardCheck,
  CheckCircle,
} from "lucide-react"
import type { BookingState, BookingAction, StepConfig } from "@/lib/booking/types"
import { BookingTopBar } from "@/components/booking/booking-top-bar"
import { BookingFooter } from "@/components/booking/booking-footer"

const STEPS: StepConfig[] = [
  {
    eyebrow: "When",
    title: "Pick a date and time",
    help: "Choose the date and time slot that works best for you.",
    icon: CalendarDays,
  },
  {
    eyebrow: "Who",
    title: "Your details",
    help: "Let us know who we'll be serving.",
    icon: User,
  },
  {
    eyebrow: "What",
    title: "Choose a service",
    help: "Select the service you'd like to book.",
    icon: Layers,
  },
  {
    eyebrow: "Configure",
    title: "Customize your service",
    help: "Tailor the service to your needs.",
    icon: SlidersHorizontal,
  },
  {
    eyebrow: "Review",
    title: "Check your booking",
    help: "Review the details before confirming.",
    icon: ClipboardCheck,
  },
  {
    eyebrow: "Done",
    title: "Booking confirmed",
    help: "Your booking has been submitted.",
    icon: CheckCircle,
  },
]

const TOTAL_STEPS = STEPS.length

const initialState: BookingState = {
  currentStep: 1,
  date: null,
  slot: null,
  email: "",
  serviceId: null,
  configuredItems: {},
}

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, date: action.date }
    case "SET_SLOT":
      return { ...state, slot: action.slot }
    case "SET_EMAIL":
      return { ...state, email: action.email }
    case "SET_SERVICE":
      return { ...state, serviceId: action.serviceId }
    case "SET_ITEM":
      return {
        ...state,
        configuredItems: { ...state.configuredItems, [action.key]: action.value },
      }
    case "NEXT":
      return state.currentStep < TOTAL_STEPS
        ? { ...state, currentStep: state.currentStep + 1 }
        : state
    case "PREV":
      return state.currentStep > 1
        ? { ...state, currentStep: state.currentStep - 1 }
        : state
    case "GO_TO":
      return action.step >= 1 && action.step <= TOTAL_STEPS
        ? { ...state, currentStep: action.step }
        : state
    default:
      return state
  }
}

function canAdvance(_step: number, _state: BookingState): boolean {
  // Placeholder: all steps are advanceable in this phase.
  // Future tasks will add real gating logic per step.
  return true
}

export function BookingShell() {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  const { currentStep } = state
  const step = STEPS[currentStep - 1]
  const StepIcon = step.icon
  const isLastStep = currentStep === TOTAL_STEPS

  return (
    <div className="flex flex-1 flex-col min-h-dvh">
      <BookingTopBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Scrollable step area */}
      <main className="flex-1 overflow-y-auto">
        <div
          key={currentStep}
          className="mx-auto max-w-[660px] px-4 py-8 animate-step-in"
        >
          {/* Placeholder panel */}
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex size-[50px] items-center justify-center rounded-[15px] bg-primary-soft">
              <StepIcon className="size-6 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">
                {step.eyebrow}
              </p>
              <h2 className="font-heading font-bold text-[26px] sm:text-[31px] leading-[1.08] tracking-[-0.025em]">
                {step.title}
              </h2>
              <p className="text-[14.5px] text-muted-foreground leading-relaxed mt-1">
                {step.help}
              </p>
            </div>
            <div className="w-full rounded-3xl bg-card ring-1 ring-foreground/10 p-8">
              <p className="text-sm text-muted-foreground">
                Step content coming soon
              </p>
            </div>
          </div>
        </div>
      </main>

      <BookingFooter
        canGoBack={currentStep > 1}
        canContinue={canAdvance(currentStep, state)}
        onBack={() => dispatch({ type: "PREV" })}
        onContinue={() => dispatch({ type: "NEXT" })}
        hidden={isLastStep}
      />
    </div>
  )
}
