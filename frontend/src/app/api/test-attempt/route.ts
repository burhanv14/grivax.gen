import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { test_id, user_id, answers } = await request.json()

    if (!test_id || !user_id || !answers) {
      return NextResponse.json({ 
        error: 'Missing required fields: test_id, user_id, answers' 
      }, { status: 400 })
    }

    // Check if user has already attempted this test
    const existingAttempt = await prisma.testAttempt.findUnique({
      where: {
        test_id_user_id: {
          test_id: test_id,
          user_id: user_id
        }
      }
    })

    if (existingAttempt) {
      if (existingAttempt.score >= 50) {
        return NextResponse.json({ 
          error: 'Test already passed. No further attempts allowed.' 
        }, { status: 400 })
      }
      // Re-attempt is allowed for failed tests - logic will be handled below
    }

    // Get test questions to calculate score
    const test = await prisma.test.findUnique({
      where: { test_id: test_id }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const questions = test.questions as any[]
    const { score, correctCount, totalQuestions } = calculateScore(questions, answers)

    let attempt;

    if (existingAttempt && existingAttempt.score < 50) {
      // Update existing attempt for retry
      attempt = await prisma.testAttempt.update({
        where: {
          attempt_id: existingAttempt.attempt_id
        },
        data: {
          answers: answers,
          score: score,
          correctCount: correctCount,
          totalQuestions: totalQuestions,
          attemptCount: existingAttempt.attemptCount + 1,
          completedAt: new Date()
        }
      })
    } else {
      // Create new test attempt
      attempt = await prisma.testAttempt.create({
        data: {
          test_id: test_id,
          user_id: user_id,
          answers: answers,
          score: score,
          correctCount: correctCount,
          totalQuestions: totalQuestions
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test attempt submitted successfully',
      attempt: {
        attempt_id: attempt.attempt_id,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        completedAt: attempt.completedAt
      }
    })

  } catch (error) {
    console.error('Error submitting test attempt:', error)
    return NextResponse.json({ error: 'Failed to submit test attempt' }, { status: 500 })
  }
}

function calculateScore(questions: any[], userAnswers: any[]) {
  let correctCount = 0
  const totalQuestions = questions.length

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index]
    if (userAnswer && userAnswer.answer === question.correctAnswer) {
      correctCount++
    }
  })

  const score = Math.round((correctCount / totalQuestions) * 100)

  return {
    score,
    correctCount,
    totalQuestions
  }
}
