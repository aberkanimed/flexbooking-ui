import { NextRequest, NextResponse } from 'next/server'
import { getAvailableDates } from '@/lib/api/availability'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl
  const startDate = searchParams.get('startDate')
  const daysParam = searchParams.get('days')

  if (!startDate || !daysParam) {
    return NextResponse.json(
      { error: 'startDate and days query parameters are required' },
      { status: 400 },
    )
  }

  const days = parseInt(daysParam, 10)
  if (isNaN(days) || days < 1 || days > 90) {
    return NextResponse.json(
      { error: 'days must be an integer between 1 and 90' },
      { status: 400 },
    )
  }

  try {
    const data = await getAvailableDates(startDate, days)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch available dates' },
      { status: 502 },
    )
  }
}
