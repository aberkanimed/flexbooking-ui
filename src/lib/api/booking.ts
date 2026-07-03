import { apiMutate } from '@/lib/api/catalog'

// ponytail: single swap point for product id, env var when multi-tenant
export const BOOKING_PRODUCT_ID = '50abefda-704b-4a79-a6dd-046522f89e99'

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface CharacteristicItemRequest {
  code: string
  value: string
  valueType: string
  unitOfMeasure: string
}

export interface ServiceSelectionRequest {
  serviceName: string
  characteristics: CharacteristicItemRequest[]
}

export interface BookingRequest {
  customerEmail: string
  productName: string
  date: string
  arrivalTime: string
  notes?: string
  services: ServiceSelectionRequest[]
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface CustomerResponse {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

export interface BookingItemResponse {
  id: string
  characteristicCode: string
  value: string
  valueType: string
  unitOfMeasure: string
  price: number
  quantity: number
  itemTotal: number
  createdAt: string
  updatedAt: string
}

export interface BookingServiceResponse {
  id: string
  serviceName: string
  basePrice: number
  items: BookingItemResponse[]
  serviceTotal: number
  createdAt: string
  updatedAt: string
}

export interface BookingResponse {
  id: string
  status: string
  customer: CustomerResponse
  productName: string
  date: string
  arrivalTime: string
  notes?: string
  subtotal: number
  total: number
  services: BookingServiceResponse[]
  createdAt?: string
  updatedAt?: string
}

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

export function createBooking(body: BookingRequest): Promise<BookingResponse> {
  return apiMutate<BookingResponse>('/v1/bookings', 'POST', body)
}
