import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// File-based storage for course data (for development)
const STORAGE_DIR = path.join(process.cwd(), 'tmp', 'course-data')

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true })
}

// Function to store course data
export function storeCourseData(courseId: string, data: any) {
  console.log(`Storing course data for ID: ${courseId}`, data)
  const filePath = path.join(STORAGE_DIR, `${courseId}.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  console.log(`Course data stored at: ${filePath}`)
}

export async function GET(
  request: Request,
  { params }: { params: { course_id: string } }
) {
  try {
    console.log(`Fetching course data for ID: ${params.course_id}`)
    
    // Retrieve the course data from file storage
    const filePath = path.join(STORAGE_DIR, `${params.course_id}.json`)
    console.log(`Looking for course data at: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      console.log(`Course file not found at: ${filePath}`)
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const courseData = JSON.parse(fileContent)
    console.log(`Found course data for ID: ${params.course_id}`, courseData)
    
    return NextResponse.json({
      success: true,
      course_id: params.course_id,
      courseStructure: courseData.courseStructure
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course data' },
      { status: 500 }
    )
  }
} 