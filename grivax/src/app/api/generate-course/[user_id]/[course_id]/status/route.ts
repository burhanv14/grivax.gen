import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { user_id: string; course_id: string } }
) {
  try {
    // Check if the course exists and is fully generated
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
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    // Check if the course has units and chapters
    const isFullyGenerated = course.units && course.units.length > 0 && 
                            course.units.every(unit => unit.chapters && unit.chapters.length > 0)
    
    if (!isFullyGenerated) {
      return NextResponse.json(
        { status: 'generating', message: 'Course is still being generated' },
        { status: 202 }
      )
    }
    
    // Course is fully generated
    return NextResponse.json({
      status: 'completed',
      message: 'Course generation completed',
      course_id: course.course_id,
      user_id: course.user_id
    })
  } catch (error) {
    console.error('Error checking course generation status:', error)
    return NextResponse.json(
      { error: 'Failed to check course generation status' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { user_id: string; course_id: string } }
) {
  try {
    const data = await request.json()
    
    // Log the acknowledgment
    console.log('Course generation completed acknowledgment received:', {
      user_id: params.user_id,
      course_id: params.course_id,
      message: data.message || 'No message provided'
    })
    
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