import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { GoogleGenAI } from '@google/genai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY')
}

const ai = new GoogleGenAI({})

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
      chapters: unit.chapters.map((c: any) => c.name)
    }

    const prompt = `You are an expert educator. Create 5-7 flashcard MCQs for unit "${unitContent.unitTitle}".
Chapters:
${unitContent.chapters.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}

Return ONLY JSON:
{
  "questions":[
    {
      "id":1,
      "question":"Question?",
      "options":{"A":"...","B":"...","C":"...","D":"..."},
      "correctAnswer":"A",
      "explanation":"..."
    }
  ]
}`

    const generation = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Return valid JSON only.',
        thinkingConfig: { thinkingBudget: 0 }
      }
    })

    let questions: any[] = []
    try {
      const text = generation.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found')
      const parsed = JSON.parse(jsonMatch[0])
      questions = Array.isArray(parsed.questions) ? parsed.questions : []
    } catch (e) {
      console.error('Parse error:', e)
      questions = createFallbackQuestions(unitContent.unitTitle)
    }
    if (!questions.length) questions = createFallbackQuestions(unitContent.unitTitle)
    return questions
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
      options: { A: "Basic concepts", B: "Advanced techniques", C: "Historical background", D: "All of the above" },
      correctAnswer: "D",
      explanation: "This unit covers multiple aspects of the topic."
    },
    {
      id: 2,
      question: `Which of the following is most important in ${unitTitle}?`,
      options: { A: "Memorization", B: "Understanding concepts", C: "Speed of completion", D: "Following instructions" },
      correctAnswer: "B",
      explanation: "Understanding underlying concepts matters most."
    }
  ]
}
