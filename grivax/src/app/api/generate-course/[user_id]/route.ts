import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: Request, { params }: { params: { user_id: string } }) {
  try {
    const data = await request.json()
    
    // Log the received data
    // console.log('Received course generation request:', {
    //   user_id: params.user_id,
    //   topic: data.topic,
    //   difficulty: data.difficulty,
    //   pace: data.pace
    // })

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
    const course_id = crypto.randomBytes(5).toString('hex')
    
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

    // Log the generated course structure
    // console.log('Generated course structure:', courseStructure)

    // Store the course data in the database
    try {
      // Use a try-catch block to handle any Prisma errors
      try {
        const genCourse = await prisma.genCourse.create({
          data: {
            user_id: params.user_id,
            course_id: course_id,
            title: courseStructure.title,
            description: courseStructure.description,
            modules: courseStructure.modules
          }
        });
        
        console.log(`Course data stored in database with ID: ${genCourse.id}`);
      } catch (prismaError: any) {
        console.error('Prisma error:', prismaError);
        throw new Error('Failed to store course data in database');
      }
    } catch (dbError) {
      console.error('Error storing course in database:', dbError)
      throw new Error('Failed to store course in database')
    }

    return NextResponse.json({ 
      success: true,
      course_id,
      courseStructure,
      redirectUrl: `/generate-courses/${params.user_id}/${course_id}`
    })
  } catch (error) {
    console.error('Error processing course generation request:', error)
    return NextResponse.json(
      { error: 'Failed to process course generation request' },
      { status: 500 }
    )
  }
} 