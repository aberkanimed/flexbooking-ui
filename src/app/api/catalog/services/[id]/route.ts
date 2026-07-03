import { NextResponse } from 'next/server'
import { getServiceById } from '@/lib/api/catalog'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  try {
    const service = await getServiceById(id)
    return NextResponse.json({
      ...service,
      characteristics: service.characteristics.filter((c) => c.active),
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 502 },
    )
  }
}
