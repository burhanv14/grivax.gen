import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { user_id: string; course_id: string; id: string } }
) {
  try {
    // Verify that the genCourse exists with the given id, user_id, and course_id
    const genCourse = await prisma.genCourse.findFirst({
      where: {
        id: params.id,
        user_id: params.user_id,
        course_id: params.course_id,
      },
    })
    
    if (!genCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    console.log('Course found:', genCourse)
    return NextResponse.json({
      message: 'Course found',
      id: genCourse.id,
      course_id: genCourse.course_id,
      user_id: genCourse.user_id
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course data' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { user_id: string; course_id: string; id: string } }
) {
  try {
    const data = await request.json()
    
    // Log the acknowledgment
    console.log('Acknowledgment received:', {
      id: params.id,
      user_id: params.user_id,
      course_id: params.course_id,
      message: data.message || 'No message provided'
    })
    
    // Verify that the genCourse exists with the given id, user_id, and course_id
    const genCourse = await prisma.genCourse.findFirst({
      where: {
        id: params.id,
        user_id: params.user_id,
        course_id: params.course_id,
      },
    })
    
    if (!genCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Acknowledgment received successfully',
      id: params.id,
      course_id: params.course_id,
      user_id: params.user_id
    })
  } catch (error) {
    console.error('Error processing acknowledgment:', error)
    return NextResponse.json(
      { error: 'Failed to process acknowledgment' },
      { status: 500 }
    )
  }
} 