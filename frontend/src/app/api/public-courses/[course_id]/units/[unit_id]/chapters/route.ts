import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/public-courses/[course_id]/units/[unit_id]/chapters - Add a new chapter to a unit
export async function POST(
  request: NextRequest,
  { params }: { params: { course_id: string; unit_id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, youtubeVidLink, readingMaterial } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Chapter name is required" }, { status: 400 });
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
      return NextResponse.json({ error: "Only teachers can add chapters" }, { status: 403 });
    }

    // Check if the unit exists and belongs to the teacher's course
    const unit = await prisma.publicUnit.findUnique({
      where: { public_unit_id: params.unit_id },
      include: {
        publicCourse: {
          select: { teacher_id: true },
        },
      },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (unit.publicCourse.teacher_id !== teacher.user_id) {
      return NextResponse.json({ error: "Unauthorized to add chapters to this unit" }, { status: 403 });
    }

    // Get the next order number for the chapter
    const lastChapter = await prisma.publicChapter.findFirst({
      where: { public_unit_id: params.unit_id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (lastChapter?.order ?? -1) + 1;

    // Create the new chapter
    const newChapter = await prisma.publicChapter.create({
      data: {
        public_unit_id: params.unit_id,
        name,
        youtubeVidLink: youtubeVidLink || "",
        readingMaterial: readingMaterial || "",
        order: nextOrder,
      },
    });

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    console.error("Error adding chapter:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
