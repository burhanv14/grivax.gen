import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Enhanced status endpoint returning granular generation progress.
 * Frontend polls this while async background generation (units/chapters)
 * proceeds. Progress is inferred from DB state; no extra tables required.
 */

export async function GET(
  request: Request,
  { params }: { params: { user_id: string; course_id: string } }
) {
  try {
    // Fetch generated course blueprint to know intended total units (modules)
    const genCourse = await prisma.genCourse.findUnique({
      where: { course_id: params.course_id },
      select: { modules: true }
    })

    const intendedUnits = Array.isArray((genCourse as any)?.modules) ? (genCourse as any).modules.length : null

    // Fetch current course with units & chapters
    const course = await prisma.course.findFirst({
      where: {
        course_id: params.course_id,
        user_id: params.user_id,
      },
      include: {
        units: {
          include: { chapters: true }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const units = course.units || []
    const unitsCreated = units.length
    const totalIntendedUnits = intendedUnits ?? unitsCreated
    const chaptersPerUnit = units.map(u => ({ unit_id: u.unit_id, chapters: u.chapters.length }))
    const totalChapters = units.reduce((acc, u) => acc + u.chapters.length, 0)

    // Basic heuristic: a unit is considered complete if it has at least 1 chapter.
    const completedUnits = units.filter(u => u.chapters.length > 0).length

    const isFullyGenerated = totalIntendedUnits > 0 && completedUnits === totalIntendedUnits

    const progressPercent = totalIntendedUnits === 0
      ? 0
      : Math.round((completedUnits / totalIntendedUnits) * 100)

    if (!isFullyGenerated) {
      return NextResponse.json({
        status: 'generating',
        message: 'Course is still being generated',
        course_id: course.course_id,
        user_id: course.user_id,
        progress: {
          percent: progressPercent,
          unitsCreated,
          completedUnits,
          totalIntendedUnits,
          totalChapters,
          chaptersPerUnit
        }
      }, { status: 202 })
    }

    return NextResponse.json({
      status: 'completed',
      message: 'Course generation completed',
      course_id: course.course_id,
      user_id: course.user_id,
      progress: {
        percent: 100,
        unitsCreated,
        completedUnits,
        totalIntendedUnits,
        totalChapters,
        chaptersPerUnit
      }
    })
  } catch (error) {
    console.error('Error checking course generation status:', error)
    return NextResponse.json({ error: 'Failed to check course generation status' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { user_id: string; course_id: string } }
) {
  try {
    const data = await request.json()
    
    // Log the acknowledgment
    // console.log('Course generation completed acknowledgment received:', {
    //   user_id: params.user_id,
    //   course_id: params.course_id,
    //   message: data.message || 'No message provided'
    // })
    
    // Verify that the course exists
    const course = await prisma.course.findFirst({
      where: {
        course_id: params.course_id,
        user_id: params.user_id,
      }
    })
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Course generation acknowledgment received',
      course_id: params.course_id,
      user_id: params.user_id
    })
  } catch (error) {
    console.error('Error processing course generation acknowledgment:', error)
    return NextResponse.json(
      { error: 'Failed to process course generation acknowledgment' },
      { status: 500 }
    )
  }
} 