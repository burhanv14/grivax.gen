import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { course_id: string } }
) {
  try {
    // In a real application, you would fetch this data from your database
    // For now, we'll return the data from memory or session storage
    // You should implement proper data persistence
    
    // Return a properly structured response
    return NextResponse.json({
      success: true,
      course_id: params.course_id,
      courseStructure: {
        title: "Sample Course",
        description: "This is a sample course structure",
        modules: [
          {
            week: 1,
            title: "Introduction",
            objectives: ["Understand basic concepts", "Set up development environment"],
            resources: [
              {
                type: "article",
                title: "Getting Started Guide",
                url: "https://example.com/guide"
              }
            ]
          }
        ]
      }
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course data' },
      { status: 500 }
    )
  }
} 