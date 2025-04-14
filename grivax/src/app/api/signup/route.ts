// app/api/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma"; // adjust the import as needed
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { name, email, password, oauthProvider } = await request.json();

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    // Generate a unique user_id
    const user_id = crypto.randomBytes(5).toString("hex"); // 10-character hex string

    if (oauthProvider) {
      // Handle OAuth sign-in
      await prisma.user.create({
        data: {
          user_id,
          email,
          name,
          password: "", // No password for OAuth users
        },
      });
    } else {
      // Handle regular sign-up
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          user_id,
          email,
          name,
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
