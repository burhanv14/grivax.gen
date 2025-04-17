import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Test database connection by executing a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      result: result,
    })
  } catch (error) {
    console.error("Error testing database connection:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to connect to database", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
} 