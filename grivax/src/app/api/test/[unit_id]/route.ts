import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { unit_id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get test with user's attempt
    const test = await prisma.test.findUnique({
      where: { unit_id: params.unit_id },
      include: {
        attempts: {
          where: { user_id: user_id },
          orderBy: { completedAt: 'desc' },
          take: 1
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const userAttempt = test.attempts[0] || null

    return NextResponse.json({
      success: true,
      test: {
        test_id: test.test_id,
        questions: test.questions,
        hasAttempted: !!userAttempt,
        userAttempt: userAttempt ? {
          score: userAttempt.score,
          correctCount: userAttempt.correctCount,
          totalQuestions: userAttempt.totalQuestions,
          completedAt: userAttempt.completedAt
        } : null
      }
    })

  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json({ error: 'Failed to fetch test' }, { status: 500 })
  }
}
