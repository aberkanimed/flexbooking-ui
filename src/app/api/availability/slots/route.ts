import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/api/availability'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json(
      { error: 'date query parameter is required' },
      { status: 400 },
    )
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'invalid date format' },
      { status: 400 },
    )
  }

  try {
    const data = await getAvailableSlots(date)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 502 },
    )
  }
}
