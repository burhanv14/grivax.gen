import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { user_id: string; course_id: string; unit_id: string; chapter_id: string } }
) {
  try {
    // Verify user session
    const session = await getServerSession(authConfig)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify course ownership
    const course = await prisma.course.findFirst({
      where: {
        course_id: params.course_id,
        user_id: params.user_id,
      },
      include: {
        units: {
          include: {
            chapters: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get chapter completion status
    const chapter = await prisma.chapter.findUnique({
      where: {
        chapter_id: params.chapter_id,
        unit_id: params.unit_id
      }
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      isCompleted: chapter.isCompleted
    })
  } catch (error) {
    console.error('Error fetching chapter status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapter status' },
      { status: 500 }
    )
  }
} 