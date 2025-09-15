import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/public-courses/[course_id] - Get a specific public course
export async function GET(
  request: NextRequest,
  { params }: { params: { course_id: string } }
) {
  try {
    const publicCourse = await prisma.publicCourse.findUnique({
      where: { public_course_id: params.course_id },
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
            chapters: {
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                user_id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!publicCourse) {
      return NextResponse.json({ error: "Public course not found" }, { status: 404 });
    }

    return NextResponse.json(publicCourse, { status: 200 });
  } catch (error) {
    console.error("Error fetching public course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/public-courses/[course_id] - Update a public course
export async function PUT(
  request: NextRequest,
  { params }: { params: { course_id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, image, isPublished, units } = await request.json();

    // Get the teacher from the session
    const teacher = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can update public courses" }, { status: 403 });
    }

    // Check if the course exists and belongs to the teacher
    const existingCourse = await prisma.publicCourse.findUnique({
      where: { public_course_id: params.course_id },
      select: { teacher_id: true },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Public course not found" }, { status: 404 });
    }

    if (existingCourse.teacher_id !== teacher.user_id) {
      return NextResponse.json({ error: "Unauthorized to update this course" }, { status: 403 });
    }

    // Update the course
    const updatedCourse = await prisma.publicCourse.update({
      where: { public_course_id: params.course_id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(image && { image }),
        ...(isPublished !== undefined && { isPublished }),
      },
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
            chapters: {
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                user_id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error("Error updating public course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/public-courses/[course_id] - Delete a public course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { course_id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the teacher from the session
    const teacher = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can delete public courses" }, { status: 403 });
    }

    // Check if the course exists and belongs to the teacher
    const existingCourse = await prisma.publicCourse.findUnique({
      where: { public_course_id: params.course_id },
      select: { teacher_id: true },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Public course not found" }, { status: 404 });
    }

    if (existingCourse.teacher_id !== teacher.user_id) {
      return NextResponse.json({ error: "Unauthorized to delete this course" }, { status: 403 });
    }

    // Delete the course (cascade will handle units and chapters)
    await prisma.publicCourse.delete({
      where: { public_course_id: params.course_id },
    });

    return NextResponse.json({ message: "Public course deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting public course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
