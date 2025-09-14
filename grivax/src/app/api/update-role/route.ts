import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();

    // Validate role
    if (!["STUDENT", "TEACHER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be STUDENT or TEACHER" }, { status: 400 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { role },
    });

    return NextResponse.json({ 
      message: "Role updated successfully", 
      role: updatedUser.role 
    }, { status: 200 });
  } catch (error) {
    console.error("Update role API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
