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

export async function POST(
  request: Request,
  { params }: { params: { user_id: string; course_id: string } }
) {
  try {
    const data = await request.json()
    
    // Log the received course data
    // console.log('Received course data from frontend:', {
    //   user_id: params.user_id,
    //   course_id: params.course_id,
    //   courseData: data
    // })
    
    // Update the course data in the database
    const updatedCourse = await prisma.genCourse.update({
      where: {
        course_id: params.course_id,
        user_id: params.user_id
      },
      data: {
        title: data.title,
        description: data.description,
        modules: data.modules
      }
    })
    
    // Fetch the genCourse.id for acknowledgment
    const genCourse = await prisma.genCourse.findFirst({
      where: {
        user_id: params.user_id,
        course_id: params.course_id
      },
      select: {
        id: true
      }
    })
    
    if (genCourse) {
      // Send acknowledgment to the new endpoint
      const acknowledgmentUrl = `/api/generate-course/${params.user_id}/${params.course_id}/${genCourse.id}`
      console.log(`Sending acknowledgment to: ${acknowledgmentUrl}`)
      
      // Make a request to the acknowledgment endpoint
      try {
        // Get the host from the request headers
        const host = request.headers.get('host') || 'localhost:3000'
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
        
        // Construct a complete URL
        const fullUrl = `${protocol}://${host}${acknowledgmentUrl}`
        console.log(`Full URL for acknowledgment: ${fullUrl}`)
        
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: 'Course update acknowledged',
            course_id: params.course_id,
            user_id: params.user_id
          }),
        })
        
        if (!response.ok) {
          console.error('Failed to send acknowledgment:', await response.text())
        }
      } catch (ackError) {
        console.error('Error sending acknowledgment:', ackError)
      }
    }
    
    // Return success response with updated data
    return NextResponse.json({ 
      success: true,
      message: 'Course data updated successfully',
      data: updatedCourse
    })
  } catch (error) {
    console.error('Error processing course data:', error)
    return NextResponse.json(
      { error: 'Failed to process course data' },
      { status: 500 }
    )
  }
} 