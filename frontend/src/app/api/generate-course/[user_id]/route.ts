import { NextResponse } from 'next/server'
// import { Anthropic } from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto'
import prisma from '@/lib/prisma'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY');
}

const ai = new GoogleGenAI({});

export async function POST(request: Request, { params }: { params: { user_id: string } }) {
  try {
    const data = await request.json()
    const durationInWeeks = parseInt(data.pace) || 4
    const formattedDuration = `${durationInWeeks} ${durationInWeeks === 1 ? 'week' : 'weeks'}`

    const prompt = `You are an AI capable of curating course content.
Topic: ${data.topic}
Difficulty: ${data.difficulty}
Duration: ${formattedDuration}

Return ONLY valid JSON:
{
  "title": "Course Title",
  "description": "Course Description",
  "modules": [
    { "week": 1, "title": "Module Title", "objectives": ["Objective 1","Objective 2"], "timeSpent": "2 hours" }
  ]
}
Total modules must equal ${durationInWeeks}.`

    const generation = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Generate structured JSON only.',
        thinkingConfig: { thinkingBudget: 0 },
      },
    })

    const course_id = crypto.randomBytes(5).toString('hex')
    let courseStructure
    try {
      const text = generation.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) courseStructure = JSON.parse(jsonMatch[0])
      else throw new Error('Parse failure')
    } catch {
      throw new Error('Failed to parse course structure')
    }

    await prisma.genCourse.create({
      data: {
        user_id: params.user_id,
        course_id,
        title: courseStructure.title,
        description: courseStructure.description,
        modules: courseStructure.modules,
      },
    })

    return NextResponse.json({
      success: true,
      course_id,
      courseStructure,
      redirectUrl: `/generate-courses/${params.user_id}/${course_id}`,
    })
  } catch (error) {
    console.error('Error processing course generation request:', error)
    return NextResponse.json(
      { error: 'Failed to process course generation request' },
      { status: 500 }
    )
  }
}