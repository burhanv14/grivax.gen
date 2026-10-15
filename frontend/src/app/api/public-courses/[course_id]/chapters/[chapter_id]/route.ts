import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PUT /api/public-courses/[course_id]/chapters/[chapter_id] - Update a public chapter
export async function PUT(
  request: NextRequest,
  { params }: { params: { course_id: string; chapter_id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, youtubeVidLink, readingMaterial } = await request.json();

    // Get the teacher from the session
    const teacher = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can update chapters" }, { status: 403 });
    }

    // Check if the chapter exists and belongs to the teacher's course
    const chapter = await prisma.publicChapter.findUnique({
      where: { public_chapter_id: params.chapter_id },
      include: {
        publicUnit: {
          include: {
            publicCourse: {
              select: { teacher_id: true },
            },
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    if (chapter.publicUnit.publicCourse.teacher_id !== teacher.user_id) {
      return NextResponse.json({ error: "Unauthorized to update this chapter" }, { status: 403 });
    }

    // Update the chapter
    const updatedChapter = await prisma.publicChapter.update({
      where: { public_chapter_id: params.chapter_id },
      data: {
        ...(name && { name }),
        ...(youtubeVidLink !== undefined && { youtubeVidLink }),
        ...(readingMaterial !== undefined && { readingMaterial }),
      },
    });

    return NextResponse.json(updatedChapter, { status: 200 });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
