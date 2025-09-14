import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { user_id, course_id } = await request.json()

    if (!user_id || !course_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: user_id, course_id' 
      }, { status: 400 })
    }

    // Get all units for the course that don't have tests
    const unitsWithoutTests = await prisma.unit.findMany({
      where: {
        course_id: course_id,
        test: null
      },
      include: {
        chapters: true
      }
    })

    if (unitsWithoutTests.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All units already have tests',
        generatedTests: 0
      })
    }

    // Generate tests for each unit
    const generatedTests = []
    for (const unit of unitsWithoutTests) {
      try {
        // Call the generate test API for each unit
        const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/generate-test/${unit.unit_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            generatedTests.push({
              unit_id: unit.unit_id,
              unit_name: unit.name,
              test_id: data.test.test_id
            })
          }
        }
      } catch (error) {
        console.error(`Error generating test for unit ${unit.unit_id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedTests.length} tests for ${unitsWithoutTests.length} units`,
      generatedTests: generatedTests
    })

  } catch (error) {
    console.error('Error generating missing tests:', error)
    return NextResponse.json({ error: 'Failed to generate missing tests' }, { status: 500 })
  }
}
