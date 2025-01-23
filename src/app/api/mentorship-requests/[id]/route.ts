import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { UserRole } from '@prisma/client'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ALUMNI) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const id = req.url.split('/').pop()
    if (!id) {
      return new NextResponse('Invalid request ID', { status: 400 })
    }

    const { status } = await req.json()

    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    // First verify this request belongs to the alumni
    const request = await db.mentorshipRequest.findFirst({
      where: {
        id,
        alumniId: session.user.id,
        status: 'PENDING',
      },
    })

    if (!request) {
      return new NextResponse('Request not found', { status: 404 })
    }

    // Update the request status
    const updatedRequest = await db.mentorshipRequest.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('[MENTORSHIP_REQUEST_UPDATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
