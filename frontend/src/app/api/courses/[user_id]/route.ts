import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { user_id: string } }) {
  try {
    const userId = params.user_id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get the current session
    const session = await getServerSession(authConfig)
    
    // If no session, return unauthorized
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // console.log(`Fetching courses for user ID: ${userId}`)
    // console.log(`Current session user email: ${session.user?.email}`)

    // First, verify the user exists
    const user = await prisma.user.findUnique({
      where: { user_id: userId }
    })

    if (!user) {
      console.log(`User not found with ID: ${userId}`)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verify that the requested user_id matches the current session user
    // This ensures users can only access their own courses
    if (user.email !== session.user?.email) {
      console.log(`Access denied: User ${session.user?.email} attempted to access courses for ${user.email}`)
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // console.log(`Found user: ${user.email}`)

    // Fetch courses for the specified user
    const courses = await prisma.course.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        units: true // Include related units
      }
    })

    // console.log(`Found ${courses.length} courses for user ID: ${userId}`)
    // console.log(courses);
    
    // Log the first course (if any) to check its structure
    // if (courses.length > 0) {
    //   console.log("Sample course data:", JSON.stringify(courses[0], null, 2))
    // }

    // Ensure we're returning an array, even if empty
    return NextResponse.json(Array.isArray(courses) ? courses : [])
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
