import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import crypto from 'crypto'
import { storeCourseData } from './[course_id]/route'

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: Request, { params }: { params: { user_id: string } }) {
  try {
    const data = await request.json()
    
    // Log the received data
    console.log('Received course generation request:', {
      user_id: params.user_id,
      topic: data.topic,
      difficulty: data.difficulty,
      pace: data.pace
    })

    // Construct the prompt for course generation
    const prompt = `You are an AI capable of curating course content, coming up with relevant chapter titles, and creating comprehensive learning paths. 
    Please create a detailed course outline for the following parameters:
    - Topic: ${data.topic}
    - Difficulty Level: ${data.difficulty}
    - Learning Pace: ${data.pace}

    Please provide a structured course outline that includes:
    1. Main topics/chapters
    2. Subtopics for each chapter
    3. Estimated time required for each topic
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
          "resources": [
            {
              "type": "article",
              "title": "Resource Title",
              "url": "Resource URL"
            }
          ]
        }
      ]
    }`

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
    console.log('Generated course structure:', courseStructure)

    // Store the course data
    console.log(`About to store course data for ID: ${course_id}`)
    storeCourseData(course_id, { courseStructure })
    console.log(`Course data stored for ID: ${course_id}`)

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