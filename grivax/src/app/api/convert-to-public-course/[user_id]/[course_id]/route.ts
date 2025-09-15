import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/convert-to-public-course/[user_id]/[course_id] - Convert generated course to public course
export async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string; course_id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, modules } = await request.json();

    if (!title || !modules || !Array.isArray(modules)) {
      return NextResponse.json({ error: "Title and modules are required" }, { status: 400 });
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

    if (teacher.user_id !== params.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the generated course exists
    const genCourse = await prisma.genCourse.findFirst({
      where: {
        course_id: params.course_id,
        user_id: params.user_id,
      },
    });

    if (!genCourse) {
      return NextResponse.json({ error: "Generated course not found" }, { status: 404 });
    }

    // Generate unique public course ID
    const public_course_id = `pub_${params.course_id}`;

    // Create the public course with units and chapters
    const publicCourse = await prisma.publicCourse.create({
      data: {
        public_course_id,
        teacher_id: teacher.user_id,
        title,
        description: description || "",
        image: "/images/learning-illustration.svg",
        isPublished: false, // Start as draft
        units: {
          create: modules.map((module: any, moduleIndex: number) => ({
            name: module.title,
            order: moduleIndex,
            chapters: {
              create: [
                // Create a default chapter for each module
                {
                  name: `${module.title} - Overview`,
                  youtubeVidLink: "",
                  readingMaterial: `# ${module.title}\n\n## Learning Objectives\n\n${module.objectives.map((obj: string) => `- ${obj}`).join('\n')}\n\n## Time Required\n\n${module.timeSpent}\n\n## Content\n\nThis module covers the fundamentals of ${module.title.toLowerCase()}.`,
                  order: 0,
                }
              ],
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
    console.error("Error converting to public course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
