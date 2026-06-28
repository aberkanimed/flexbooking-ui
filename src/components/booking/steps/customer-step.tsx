"use client"

import { useState, type Dispatch } from "react"
import type { BookingState, BookingAction } from "@/lib/booking/types"
import { StepHeading } from "@/components/booking/step-heading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isValidEmail } from "@/lib/booking/validation"

interface CustomerStepProps {
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

export function CustomerStep({ state, dispatch }: CustomerStepProps) {
  const [touched, setTouched] = useState(false)

  const email = state.email
  const error = touched
    ? email.trim() === ""
      ? "Email is required"
      : !isValidEmail(email)
        ? "Enter a valid email"
        : null
    : null

  const errorId = "customer-email-error"

  return (
    <>
      <StepHeading
        eyebrow="Who"
        title="Your details"
        help="We just need your email to send a confirmation."
      />
      <div className="bg-card ring-1 ring-foreground/10 rounded-3xl p-8 w-full max-w-[540px] mx-auto flex flex-col gap-4 shadow-card">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            value={email}
            onChange={(e) => dispatch({ type: "SET_EMAIL", email: e.target.value })}
            onBlur={() => setTouched(true)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
          {error && (
            <p id={errorId} className="text-[13px] text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
