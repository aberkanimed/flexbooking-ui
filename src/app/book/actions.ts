"use server"

import { getProductById } from "@/lib/api/catalog"
import { createBooking, BOOKING_PRODUCT_ID } from "@/lib/api/booking"
import type { CharacteristicItemRequest, BookingResponse } from "@/lib/api/booking"

export interface SubmitBookingInput {
  customerEmail: string
  date: string
  arrivalTime: string
  serviceName: string
  characteristics: CharacteristicItemRequest[]
  notes?: string
}

type SubmitBookingResult =
  | { ok: true; booking: BookingResponse }
  | { ok: false; errors: string[] }

export async function submitBookingAction(
  input: SubmitBookingInput,
): Promise<SubmitBookingResult> {
  try {
    const product = await getProductById(BOOKING_PRODUCT_ID)
    const booking = await createBooking({
      customerEmail: input.customerEmail,
      productName: product.name,
      date: input.date,
      arrivalTime: input.arrivalTime,
      notes: input.notes,
      services: [
        {
          serviceName: input.serviceName,
          characteristics: input.characteristics,
        },
      ],
    })
    return { ok: true, booking }
  } catch (err) {
    const errors: string[] =
      (err as { errors?: string[] }).errors ?? [
        err instanceof Error ? err.message : "Booking failed",
      ]
    return { ok: false, errors }
  }
}
