import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/public-courses/[course_id]/enroll - Enroll a student in a public course
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

    // Only teachers can enroll students
    if (currentUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can enroll students" }, { status: 403 });
    }

    // Check if the public course exists and belongs to the teacher
    const publicCourse = await prisma.publicCourse.findUnique({
      where: { public_course_id: params.course_id },
      select: { teacher_id: true, isPublished: true },
    });

    if (!publicCourse) {
      return NextResponse.json({ error: "Public course not found" }, { status: 404 });
    }

    if (publicCourse.teacher_id !== currentUser.user_id) {
      return NextResponse.json({ error: "Unauthorized to enroll students in this course" }, { status: 403 });
    }

    // Check if the student exists
    const student = await prisma.user.findUnique({
      where: { user_id: student_id },
      select: { user_id: true, role: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json({ error: "User is not a student" }, { status: 400 });
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
      return NextResponse.json({ error: "Student is already enrolled in this course" }, { status: 400 });
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

// GET /api/public-courses/[course_id]/enroll - Get enrolled students for a public course
export async function GET(
  request: NextRequest,
  { params }: { params: { course_id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Get the current user from the session
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only teachers can view enrolled students
    if (currentUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can view enrolled students" }, { status: 403 });
    }

    // Check if the public course exists and belongs to the teacher
    const publicCourse = await prisma.publicCourse.findUnique({
      where: { public_course_id: params.course_id },
      select: { teacher_id: true },
    });

    if (!publicCourse) {
      return NextResponse.json({ error: "Public course not found" }, { status: 404 });
    }

    if (publicCourse.teacher_id !== currentUser.user_id) {
      return NextResponse.json({ error: "Unauthorized to view students for this course" }, { status: 403 });
    }

    // Build search filter
    let whereClause: any = {
      public_course_id: params.course_id,
    };

    if (search) {
      whereClause.student = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Get enrolled students
    const enrollments = await prisma.publicCourseEnrollment.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return NextResponse.json(enrollments, { status: 200 });
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
