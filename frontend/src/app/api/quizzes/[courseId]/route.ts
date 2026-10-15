import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY');
}

const ai = new GoogleGenAI({});

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;

    // Check if course exists and belongs to user
    const course = await prisma.course.findFirst({
      where: {
        course_id: courseId,
        user: {
          email: session.user.email
        }
      },
      include: {
        units: {
          include: {
            chapters: true
          }
        },
        quiz: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if quiz already exists
    if (course.quiz) {
      return NextResponse.json({ error: 'Quiz already exists for this course' }, { status: 400 });
    }

    // Generate quiz questions based on course content
    const questions = await generateQuizQuestions(course);

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        course_id: courseId,
        questions: questions
      }
    });

    return NextResponse.json({ 
      success: true, 
      quiz: {
        quiz_id: quiz.quiz_id,
        questions: quiz.questions
      }
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get quiz for the course
    const quiz = await prisma.quiz.findFirst({
      where: {
        course_id: courseId,
        course: {
          user: {
            email: session.user.email
          }
        }
      },
      include: {
        attempts: {
          where: {
            user_id: user.user_id
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const hasAttempt = quiz.attempts.length > 0;

    return NextResponse.json({ 
      quiz: {
        quiz_id: quiz.quiz_id,
        questions: quiz.questions
      },
      hasAttempt: hasAttempt,
      attempt: hasAttempt ? quiz.attempts[0] : null
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateQuizQuestions(course: any) {
  try {
    const courseTitle = course.title;
    const units = course.units.map((u: any) => ({
      name: u.name,
      chapters: u.chapters.map((c: any) => c.name),
    }));

    const prompt = `Create JSON with exactly 5 MCQ questions for course "${courseTitle}".
Units:
${units.map((u, i) => `Unit ${i + 1}: ${u.name} (${u.chapters.join(', ')})`).join('\n')}

Format:
{
  "questions":[
    {
      "questionText":"...",
      "options":["A","B","C","D"],
      "correctAnswer":0,
      "explanation":"..."
    }
  ]
}`;

    const generation = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Return ONLY valid JSON.',
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = generation.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Parse error');
    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed.questions)) throw new Error('Invalid structure');

    const questions = parsed.questions.slice(0, 5).map((q: any, i: number) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || 'No explanation provided',
    }));

    while (questions.length < 5) {
      questions.push({
        questionText: `What is the main focus of "${courseTitle}"?`,
        options: [
          'Core practical concepts',
          'Irrelevant topics',
          'Outdated methods',
          'Random theory',
        ],
        correctAnswer: 0,
        explanation: 'Focuses on practical core concepts.',
      });
    }
    return questions;
  } catch (e) {
    console.error('Gemini generation failed, using fallback:', e);
    return generateFallbackQuestions(course);
  }
}

function generateFallbackQuestions(course: any) {
  // Simple fallback questions in case LLM fails
  const questions = [];
  
  questions.push({
    questionText: `What is the primary subject of the "${course.title}" course?`,
    options: [
      `Learning and understanding ${course.title}`,
      `Basic computer literacy`,
      `Hardware troubleshooting`,
      `Network administration`
    ],
    correctAnswer: 0,
    explanation: `This course is designed to teach ${course.title} concepts and applications.`
  });

  // Add questions based on units
  course.units.slice(0, 4).forEach((unit: any, index: number) => {
    questions.push({
      questionText: `What is covered in the "${unit.name}" unit?`,
      options: [
        `Core concepts and practical applications of ${unit.name}`,
        `Unrelated programming topics`,
        `Hardware specifications`,
        `Network protocols`
      ],
      correctAnswer: 0,
      explanation: `The ${unit.name} unit focuses on teaching the essential concepts and practical applications in this area.`
    });
  });

  return questions.slice(0, 5);
}