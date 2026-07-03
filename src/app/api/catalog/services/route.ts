import { NextResponse } from 'next/server'
import { getProductById } from '@/lib/api/catalog'
import { BOOKING_PRODUCT_ID } from '@/lib/api/booking'

export async function GET(): Promise<NextResponse> {
  try {
    const product = await getProductById(BOOKING_PRODUCT_ID)
    const services = product.services.filter((s) => s.active)
    return NextResponse.json({ services })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 502 },
    )
  }
}
