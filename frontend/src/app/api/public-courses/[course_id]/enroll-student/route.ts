import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/public-courses/[course_id]/enroll-student - Enroll a student in a public course
export async function POST(
  request: NextRequest,
  { params }: { params: { course_id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { student_id } = await request.json();

    if (!student_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // Get the current user from the session
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only students can enroll themselves
    if (currentUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can enroll in courses" }, { status: 403 });
    }

    // Verify the student_id matches the current user
    if (currentUser.user_id !== student_id) {
      return NextResponse.json({ error: "Unauthorized to enroll on behalf of another user" }, { status: 403 });
    }

    // Check if the public course exists and is published
    const publicCourse = await prisma.publicCourse.findUnique({
      where: { public_course_id: params.course_id },
      select: { isPublished: true },
    });

    if (!publicCourse) {
      return NextResponse.json({ error: "Public course not found" }, { status: 404 });
    }

    if (!publicCourse.isPublished) {
      return NextResponse.json({ error: "Course is not published yet" }, { status: 400 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.publicCourseEnrollment.findUnique({
      where: {
        public_course_id_student_id: {
          public_course_id: params.course_id,
          student_id: student_id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "You are already enrolled in this course" }, { status: 400 });
    }

    // Create the enrollment
    const enrollment = await prisma.publicCourseEnrollment.create({
      data: {
        public_course_id: params.course_id,
        student_id: student_id,
      },
      include: {
        student: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
        publicCourse: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Error enrolling student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
