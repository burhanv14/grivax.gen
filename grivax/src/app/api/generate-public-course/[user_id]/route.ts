import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: Request, { params }: { params: { user_id: string } }) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the teacher from the session
    const teacher = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    })

    if (!teacher) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can create public courses" }, { status: 403 })
    }

    if (teacher.user_id !== params.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()
    
    // Format the pace value for the prompt
    const durationInWeeks = parseInt(data.pace) || 4; // Default to 4 weeks if parsing fails
    const formattedDuration = `${durationInWeeks} ${durationInWeeks === 1 ? 'week' : 'weeks'}`;

    // Construct the prompt for course generation
    const prompt = `You are an AI capable of curating course content, coming up with relevant chapter titles, and creating comprehensive learning paths. 
    Please create a detailed course outline for the following parameters:
    - Topic: ${data.topic}
    - Difficulty Level: ${data.difficulty}
    - Course Duration: ${formattedDuration}

    Please provide a structured course outline that includes:
    1. Main topics/chapters
    2. Subtopics for each chapter
    3. Estimated time required for each topic(number of hours & not a range)
    4. Prerequisites (if any)
    5. Learning objectives for each chapter

    Format the response as a JSON object with the following structure:
    {
      "title": "Course Title",
      "description": "Course Description",
      "modules": [
        {
          "week": 1,
          "title": "Module Title",
          "objectives": ["Objective 1", "Objective 2"],
          "timeSpent": "2 hours"
        }
      ]
    }

    Important: Structure the course content to fit within the specified duration of ${formattedDuration}. Each module should represent one week of content, and the total number of modules should match the course duration.`

    // Generate course content using Claude
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Generate unique course ID
    const public_course_id = crypto.randomBytes(5).toString('hex')
    
    // Parse the course content from the response
    let courseStructure
    try {
      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : JSON.stringify(response.content[0])
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        courseStructure = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse course structure from response')
      }
    } catch (error) {
      console.error('Error parsing course structure:', error)
      throw new Error('Failed to parse course structure')
    }

    // Store the course data in the database as a GenCourse first
    try {
      const genCourse = await prisma.genCourse.create({
        data: {
          user_id: params.user_id,
          course_id: public_course_id,
          title: courseStructure.title,
          description: courseStructure.description,
          modules: courseStructure.modules
        }
      });
      
      console.log(`Public course data stored in database with ID: ${genCourse.id}`);
    } catch (prismaError: any) {
      console.error('Prisma error:', prismaError);
      throw new Error('Failed to store course data in database');
    }

    return NextResponse.json({ 
      success: true,
      public_course_id,
      courseStructure,
      redirectUrl: `/generate-public-course/${params.user_id}/${public_course_id}`
    })
  } catch (error) {
    console.error('Error processing public course generation request:', error)
    return NextResponse.json(
      { error: 'Failed to process public course generation request' },
      { status: 500 }
    )
  }
}
