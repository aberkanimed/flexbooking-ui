"use client"

import { useReducer, useTransition } from "react"
import type { Dispatch } from "react"
import { submitBookingAction } from "@/app/book/actions"
import { buildConfiguredItemsPayload } from "@/lib/booking/pricing"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { isValidEmail } from "@/lib/booking/validation"
import { computeEstimate } from "@/lib/booking/pricing"
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
  serviceDetail: null,
  configuredItems: {},
  bookingResult: null,
  submitErrors: [],
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
      return { ...state, serviceId: action.serviceId, serviceDetail: null, configuredItems: {} }
    case "SET_SERVICE_DETAIL":
      return { ...state, serviceDetail: action.payload }
    case "SET_ITEM":
      return {
        ...state,
        configuredItems: { ...state.configuredItems, [action.key]: { value: action.value } },
      }
    case "NEXT":
      return state.currentStep < TOTAL_STEPS
        ? { ...state, currentStep: state.currentStep + 1 }
        : state
    case "PREV":
      return state.currentStep > 1
        ? { ...state, currentStep: state.currentStep - 1 }
        : state
    case "SET_BOOKING_RESULT":
      return { ...state, bookingResult: action.booking }
    case "SET_SUBMIT_ERRORS":
      return { ...state, submitErrors: action.errors }
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
  if (step === 2) return isValidEmail(state.email)
  if (step === 3) return !!state.serviceId
  return true
}

export function BookingShell() {
  const [state, dispatch] = useReducer(bookingReducer, initialState)
  const [isPending, startTransition] = useTransition()

  const { currentStep } = state
  const ActiveStep = STEP_COMPONENTS[currentStep - 1]
  const hideFooter = currentStep >= TOTAL_STEPS
  const isReview = currentStep === TOTAL_STEPS - 1
  const estimate = state.serviceDetail
    ? computeEstimate(state.serviceDetail, state.configuredItems)
    : undefined

  function handleConfirm() {
    const { date, slot, email, serviceDetail, configuredItems } = state
    if (!date || !slot || !serviceDetail) return
    dispatch({ type: "SET_SUBMIT_ERRORS", errors: [] })
    startTransition(async () => {
      const result = await submitBookingAction({
        customerEmail: email,
        date,
        arrivalTime: slot,
        serviceName: serviceDetail.name,
        characteristics: buildConfiguredItemsPayload(serviceDetail, configuredItems),
      })
      if (result.ok) {
        dispatch({ type: "SET_BOOKING_RESULT", booking: result.booking })
        dispatch({ type: "NEXT" })
      } else {
        dispatch({ type: "SET_SUBMIT_ERRORS", errors: result.errors })
      }
    })
  }

  return (
    <div className="flex flex-col h-dvh">
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
        hidden={hideFooter}
        estimate={isReview ? undefined : estimate}
        primaryAction={isReview ? {
          label: isPending ? "Confirming…" : "Confirm booking",
          onClick: handleConfirm,
          disabled: isPending,
        } : undefined}
      />
    </div>
  )
}
