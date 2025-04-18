import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'

export async function POST(
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

    // Update chapter completion status
    const updatedChapter = await prisma.chapter.update({
      where: {
        chapter_id: params.chapter_id,
        unit_id: params.unit_id
      },
      data: {
        isCompleted: true
      }
    })

    // Calculate unit progress
    const unit = await prisma.unit.findUnique({
      where: { unit_id: params.unit_id },
      include: { chapters: true }
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    const completedChapters = unit.chapters.filter(ch => ch.isCompleted).length
    const unitProgress = Math.round((completedChapters / unit.chapters.length) * 100)

    // Update unit progress
    await prisma.unit.update({
      where: { unit_id: params.unit_id },
      data: { progress: unitProgress }
    })

    // Calculate course progress
    const courseUnits = await prisma.unit.findMany({
      where: { course_id: params.course_id },
      include: { chapters: true }
    })

    const completedUnits = courseUnits.filter(unit => 
      unit.chapters.every(ch => ch.isCompleted)
    ).length

    const courseProgress = Math.round((completedUnits / courseUnits.length) * 100)

    // Update course progress
    await prisma.course.update({
      where: { course_id: params.course_id },
      data: { progress: courseProgress }
    })

    return NextResponse.json({
      success: true,
      message: 'Chapter marked as completed',
      chapter: updatedChapter,
      unitProgress,
      courseProgress
    })
  } catch (error) {
    console.error('Error updating chapter completion:', error)
    return NextResponse.json(
      { error: 'Failed to update chapter completion' },
      { status: 500 }
    )
  }
} 