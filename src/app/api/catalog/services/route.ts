import { NextResponse } from 'next/server'
import { getProductById } from '@/lib/api/catalog'

// ponytail: hardcoded product id, single swap point for future owner→product lookup
const BOOKING_PRODUCT_ID = '50abefda-704b-4a79-a6dd-046522f89e99'

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
