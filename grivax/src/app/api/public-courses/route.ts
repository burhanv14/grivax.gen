import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/public-courses - Get all published public courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacher_id");
    const published = searchParams.get("published") === "true";

    let whereClause: any = {};
    
    if (teacherId) {
      whereClause.teacher_id = teacherId;
    }
    
    if (published !== null) {
      whereClause.isPublished = published;
    }

    const publicCourses = await prisma.publicCourse.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(publicCourses, { status: 200 });
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/public-courses - Create a new public course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, image, units } = await request.json();

    if (!title || !units || !Array.isArray(units)) {
      return NextResponse.json({ error: "Title and units are required" }, { status: 400 });
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
      return NextResponse.json({ error: "Only teachers can create public courses" }, { status: 403 });
    }

    // Create the public course with units and chapters
    const publicCourse = await prisma.publicCourse.create({
      data: {
        teacher_id: teacher.user_id,
        title,
        description: description || "",
        image: image || "/images/learning-illustration.svg",
        isPublished: false, // Start as draft
        units: {
          create: units.map((unit: any, unitIndex: number) => ({
            name: unit.name,
            order: unitIndex,
            chapters: {
              create: unit.chapters?.map((chapter: any, chapterIndex: number) => ({
                name: chapter.name,
                youtubeVidLink: chapter.youtubeVidLink || "",
                readingMaterial: chapter.readingMaterial || "",
                order: chapterIndex,
              })) || [],
            },
          })),
        },
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
            chapters: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(publicCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating public course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
