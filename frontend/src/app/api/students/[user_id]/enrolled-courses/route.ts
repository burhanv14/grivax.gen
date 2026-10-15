import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/students/[user_id]/enrolled-courses - Get enrolled public courses for a student
export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user from the session
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only students can access their enrolled courses
    if (currentUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can access enrolled courses" }, { status: 403 });
    }

    // Verify the user_id matches the current user
    if (currentUser.user_id !== params.user_id) {
      return NextResponse.json({ error: "Unauthorized to access other user's courses" }, { status: 403 });
    }

    // Get enrolled public courses
    const enrolledCourses = await prisma.publicCourseEnrollment.findMany({
      where: {
        student_id: params.user_id,
      },
      include: {
        publicCourse: {
          include: {
            teacher: {
              select: {
                user_id: true,
                name: true,
                email: true,
              },
            },
            units: {
              include: {
                chapters: true,
              },
              orderBy: {
                order: "asc",
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedCourses = enrolledCourses.map(enrollment => ({
      ...enrollment.publicCourse,
      enrollment: {
        enrollment_id: enrollment.enrollment_id,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
      },
    }));

    return NextResponse.json(transformedCourses, { status: 200 });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
