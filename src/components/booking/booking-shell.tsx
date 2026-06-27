"use client"

import { useReducer } from "react"
import type { Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { BookingTopBar } from "@/components/booking/booking-top-bar"
import { BookingFooter } from "@/components/booking/booking-footer"
import { DateTimeStep } from "@/components/booking/steps/date-time-step"
import { CustomerStep } from "@/components/booking/steps/customer-step"
import { ServiceStep } from "@/components/booking/steps/service-step"
import { ItemsStep } from "@/components/booking/steps/items-step"
import { ReviewStep } from "@/components/booking/steps/review-step"
import { ConfirmationStep } from "@/components/booking/steps/confirmation-step"

type StepComponentType = React.ComponentType<{
  state: BookingState
  dispatch: Dispatch<BookingAction>
}>

const STEP_COMPONENTS: StepComponentType[] = [
  DateTimeStep,
  CustomerStep,
  ServiceStep,
  ItemsStep,
  ReviewStep,
  ConfirmationStep,
]

const TOTAL_STEPS = STEP_COMPONENTS.length

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

function canAdvance(step: number, state: BookingState): boolean {
  if (step === 1) return !!state.date && !!state.slot
  return true
}

export function BookingShell() {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  const { currentStep } = state
  const isLastStep = currentStep === TOTAL_STEPS
  const ActiveStep = STEP_COMPONENTS[currentStep - 1]

  return (
    <div className="flex flex-1 flex-col min-h-dvh">
      <BookingTopBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Scrollable step area */}
      <main className="flex-1 overflow-y-auto">
        <div
          key={currentStep}
          className="mx-auto max-w-[660px] px-4 py-8 animate-step-in"
        >
          <ActiveStep state={state} dispatch={dispatch} />
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
