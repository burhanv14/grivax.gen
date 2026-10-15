import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const body = await request.json();
    const { answers } = body; // Array of selected answer indices

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
    }

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
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check if user already has an attempt for this quiz
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quiz_id: quiz.quiz_id,
        user_id: user.user_id
      }
    });

    if (existingAttempt) {
      return NextResponse.json({ 
        error: 'You have already completed this quiz. You can only review your previous attempt.' 
      }, { status: 400 });
    }

    const questions = quiz.questions as any[];
    
    if (answers.length !== questions.length) {
      return NextResponse.json({ 
        error: 'Number of answers does not match number of questions' 
      }, { status: 400 });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }

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

    const score = (correctAnswers / questions.length) * 100;

    // Save the quiz attempt to database
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        quiz_id: quiz.quiz_id,
        user_id: user.user_id,
        answers: answers,
        score: Math.round(score),
        correctCount: correctAnswers,
        totalQuestions: questions.length
      }
    });

    return NextResponse.json({
      success: true,
      score: Math.round(score),
      correctAnswers: correctAnswers,
      totalQuestions: questions.length,
      results: results,
      attemptId: quizAttempt.attempt_id
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}