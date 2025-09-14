import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Anthropic } from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(
  request: Request,
  { params }: { params: { unit_id: string } }
) {
  try {
    // Get unit details with chapters
    const unit = await prisma.unit.findUnique({
      where: { unit_id: params.unit_id },
      include: {
        chapters: true,
        course: true
      }
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Check if test already exists
    const existingTest = await prisma.test.findUnique({
      where: { unit_id: params.unit_id }
    })

    if (existingTest) {
      return NextResponse.json({ 
        message: 'Test already exists',
        test: existingTest 
      })
    }

    // Generate flashcard questions based on unit content
    const questions = await generateFlashcardQuestions(unit)

    // Create test in database
    const test = await prisma.test.create({
      data: {
        unit_id: params.unit_id,
        questions: questions
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Test generated successfully',
      test: test
    })

  } catch (error) {
    console.error('Error generating test:', error)
    return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 })
  }
}

async function generateFlashcardQuestions(unit: any) {
  try {
    // Extract key information from unit and chapters
    const unitContent = {
      unitTitle: unit.name,
      chapters: unit.chapters.map((chapter: any) => ({
        title: chapter.name,
        readingMaterial: chapter.readingMaterial
      }))
    }

    const prompt = `You are an expert educator creating flashcard questions for a unit test. 

Unit: ${unitContent.unitTitle}

Chapters in this unit:
${unitContent.chapters.map((chapter: any, index: number) => 
  `${index + 1}. ${chapter.title}`
).join('\n')}

Create 5-7 flashcard questions that test understanding of the key concepts from this unit. Each question should be:
- A clear, concise question
- Have 4 multiple choice options (A, B, C, D)
- Include the correct answer
- Cover different aspects of the unit content

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "What is the main concept?",
      "options": {
        "A": "Option A",
        "B": "Option B", 
        "C": "Option C",
        "D": "Option D"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = response.content[0]
    if (content.type === 'text') {
      try {
        const parsed = JSON.parse(content.text)
        return parsed.questions || []
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError)
        return createFallbackQuestions(unitContent.unitTitle)
      }
    }

    return createFallbackQuestions(unitContent.unitTitle)

  } catch (error) {
    console.error('Error generating flashcard questions:', error)
    return createFallbackQuestions(unit.name)
  }
}

function createFallbackQuestions(unitTitle: string) {
  return [
    {
      id: 1,
      question: `What is the main topic covered in ${unitTitle}?`,
      options: {
        A: "Basic concepts",
        B: "Advanced techniques", 
        C: "Historical background",
        D: "All of the above"
      },
      correctAnswer: "D",
      explanation: "This unit covers multiple aspects of the topic."
    },
    {
      id: 2,
      question: `Which of the following is most important in ${unitTitle}?`,
      options: {
        A: "Memorization",
        B: "Understanding concepts",
        C: "Speed of completion",
        D: "Following instructions"
      },
      correctAnswer: "B",
      explanation: "Understanding the underlying concepts is most important for learning."
    }
  ]
}
