import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Test database connection by fetching all courses
    const courses = await prisma.course.findMany({
      take: 10, // Limit to 10 courses
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      count: courses.length,
      courses: courses,
    })
  } catch (error) {
    console.error("Error testing database connection:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to connect to database", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
} 