import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    // Get quiz and attempt for the course
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

    const attempt = quiz.attempts[0]; // Should only be one attempt per user

    if (!attempt) {
      return NextResponse.json({ error: 'No quiz attempt found' }, { status: 404 });
    }

    // Calculate detailed results
    const questions = quiz.questions as any[];
    const userAnswers = attempt.answers as number[];
    
    const results = questions.map((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      return {
        questionIndex: index,
        questionText: question.questionText,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation || 'No explanation available',
        options: question.options
      };
    });

    return NextResponse.json({
      success: true,
      quiz: {
        quiz_id: quiz.quiz_id,
        questions: quiz.questions
      },
      attempt: {
        attempt_id: attempt.attempt_id,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        completedAt: attempt.completedAt,
        answers: attempt.answers
      },
      results: results
    });

  } catch (error) {
    console.error('Error fetching quiz attempt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}