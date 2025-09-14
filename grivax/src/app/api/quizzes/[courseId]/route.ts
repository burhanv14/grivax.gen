import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

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
    // Extract course information for context
    const courseTitle = course.title;
    const units = course.units.map((unit: any) => ({
      name: unit.name,
      chapters: unit.chapters.map((chapter: any) => ({
        name: chapter.name,
        hasContent: !!chapter.readingMaterial
      }))
    }));

    // Create comprehensive prompt for quiz generation
    const prompt = `You are an expert educational content creator specializing in creating high-quality quiz questions for online courses.

Please create a quiz for the following course:

**Course Title:** ${courseTitle}

**Course Structure:**
${units.map((unit: any, index: number) => 
  `Unit ${index + 1}: ${unit.name}
  Chapters: ${unit.chapters.map((ch: any) => `- ${ch.name}`).join('\n  ')}`
).join('\n\n')}

**Requirements:**
1. Generate exactly 5 multiple-choice questions
2. Questions should cover different units/topics from the course
3. Each question should have 4 options (A, B, C, D)
4. Questions should test practical understanding, not just memorization
5. Include a mix of question types: conceptual understanding, application, analysis, and best practices
6. Provide clear explanations for the correct answers
7. Make questions relevant to real-world scenarios where possible

**Question Types to Include:**
- Fundamental concepts and definitions
- Practical applications and use cases
- Best practices and common patterns
- Problem-solving scenarios
- Comparison and analysis

**Format the response as a JSON object:**
{
  "questions": [
    {
      "questionText": "Clear, specific question about the topic",
      "options": [
        "Option A - Correct answer",
        "Option B - Plausible distractor",
        "Option C - Plausible distractor", 
        "Option D - Plausible distractor"
      ],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why the correct answer is right and why others are wrong"
    }
  ]
}

Make sure questions are:
- Specific to the course content
- Challenging but fair
- Educationally valuable
- Diverse in scope
- Professional in tone

Course Topic: ${courseTitle}`;

    // Generate quiz using Claude
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse the quiz questions from the response
    let quizData;
    try {
      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : JSON.stringify(response.content[0]);
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse quiz structure from response');
      }
    } catch (error) {
      console.error('Error parsing quiz structure:', error);
      throw new Error('Failed to parse quiz structure');
    }

    // Validate the quiz structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz structure received from LLM');
    }

    // Ensure we have exactly 5 questions and validate each question
    const questions = quizData.questions.slice(0, 5).map((q: any, index: number) => {
      if (!q.questionText || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question structure at index ${index}`);
      }
      
      return {
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer || 0, // Default to first option if not specified
        explanation: q.explanation || 'No explanation provided'
      };
    });

    // If we don't have enough questions, fill with fallback questions
    while (questions.length < 5) {
      questions.push({
        questionText: `What is the main focus of the "${courseTitle}" course?`,
        options: [
          `Understanding and applying the core concepts covered in the course`,
          `Memorizing theoretical definitions without practical application`,
          `Learning unrelated programming languages`,
          `Studying outdated industry practices`
        ],
        correctAnswer: 0,
        explanation: `This course focuses on practical understanding and application of ${courseTitle} concepts.`
      });
    }

    console.log(`Generated ${questions.length} questions for course: ${courseTitle}`);
    return questions;

  } catch (error) {
    console.error('Error generating quiz with LLM:', error);
    
    // Fallback to basic questions if LLM fails
    console.log('Falling back to basic quiz generation');
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