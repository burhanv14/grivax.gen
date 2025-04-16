import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { user_id: string; course_id: string } }
) {
  try {
    const data = await prisma.genCourse.findFirst({
      where: {
        user_id: params.user_id as string,
        course_id: params.course_id as string,
      },
    })
    
    if (!data) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Format the data to match the expected structure in the frontend
    const formattedData = {
      course_id: data.course_id,
      title: data.title,
      description: data.description,
      modules: data.modules
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course data' },
      { status: 500 }
    )
  }
} 