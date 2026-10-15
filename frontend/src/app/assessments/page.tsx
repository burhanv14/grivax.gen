'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, AlertCircle } from 'lucide-react'
import Loader from '@/components/loader'
import { toast } from 'sonner'

interface Course {
  course_id: string
  title: string
  image: string
  progress: number
  units: Array<{
    unit_id: string
    name: string
    chapters: Array<{
      chapter_id: string
      name: string
      isCompleted: boolean
    }>
  }>
  quiz?: {
    quiz_id: string
    questions: any[]
    attempts: Array<{
      attempt_id: string
      score: number
      correctCount: number
      totalQuestions: number
      completedAt: string
    }>
  }
  createdAt: string
}

interface QuizCompletion {
  courseId: string
  completed: boolean
  score?: number
}

export default function AssessmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchUserCourses()
    }
  }, [status, router])

  const fetchUserCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses/user')
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const getQuizAttempt = (course: Course) => {
    return course.quiz?.attempts?.[0] || null
  }

  const hasQuizAttempt = (course: Course) => {
    return !!getQuizAttempt(course)
  }

  const handleTakeAssessment = async (courseId: string) => {
    try {
      setGeneratingQuiz(courseId)
      
      // First, try to get existing quiz
      const quizResponse = await fetch(`/api/quizzes/${courseId}`)
      
      if (quizResponse.ok) {
        // Quiz exists, navigate to quiz page
        router.push(`/assessments/${courseId}`)
        return
      }

      // Quiz doesn't exist, generate it
      const generateResponse = await fetch(`/api/quizzes/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      toast.success('Quiz generated successfully!')
      
      // Navigate to the quiz
      router.push(`/assessments/${courseId}`)
      
    } catch (error) {
      console.error('Error handling assessment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start assessment')
    } finally {
      setGeneratingQuiz(null)
    }
  }

  const getCompletedChapters = (course: Course) => {
    const totalChapters = course.units.reduce((total, unit) => total + unit.chapters.length, 0)
    const completedChapters = course.units.reduce(
      (total, unit) => total + unit.chapters.filter(chapter => chapter.isCompleted).length,
      0
    )
    return { completed: completedChapters, total: totalChapters }
  }

  const getProgressPercentage = (course: Course) => {
    const { completed, total } = getCompletedChapters(course)
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Course Assessments
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Test your knowledge and understanding of the courses you've completed. 
              Take assessments to validate your learning progress.
            </p>
          </div>



          {/* Courses Grid */}
          {courses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Courses Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't enrolled in any courses yet. Start learning to unlock assessments!
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const { completed, total } = getCompletedChapters(course)
                const progressPercentage = getProgressPercentage(course)
                const hasQuiz = !!course.quiz
                const isGenerating = generatingQuiz === course.course_id
                const quizAttempt = getQuizAttempt(course)
                const quizCompleted = hasQuizAttempt(course)

                return (
                  <Card key={course.course_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <CardDescription>
                        {course.units.length} units • {total} chapters
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Progress
                          </span>
                          <span className="font-medium">
                            {completed}/{total} chapters
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {progressPercentage}% complete
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex justify-between items-center">
                        {quizCompleted && quizAttempt ? (
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Quiz Completed
                            </Badge>
                            <Badge className={`${
                              quizAttempt.score >= 80 ? 'bg-green-100 text-green-800 border-green-200' :
                              quizAttempt.score >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {quizAttempt.score}%
                            </Badge>
                          </div>
                        ) : hasQuiz ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Assessment Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Assessment Not Generated
                          </Badge>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full"
                        onClick={() => handleTakeAssessment(course.course_id)}
                        disabled={isGenerating}
                        variant={progressPercentage < 30 ? "outline" : "default"}
                      >
                        {isGenerating ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Generating Quiz...</span>
                          </div>
                        ) : quizCompleted ? (
                          'Review Quiz'
                        ) : hasQuiz ? (
                          'Take Assessment'
                        ) : (
                          'Generate Assessment'
                        )}
                      </Button>

                      {progressPercentage < 30 && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
                          Complete more chapters for better assessment quality
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}