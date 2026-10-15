'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import Loader from '@/components/loader'
import { toast } from 'sonner'

interface Question {
  questionText: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface QuizData {
  quiz: {
    quiz_id: string
    questions: Question[]
  }
  hasAttempt: boolean
  attempt?: {
    attempt_id: string
    score: number
    correctCount: number
    totalQuestions: number
    completedAt: string
    answers: number[]
  }
}

interface QuizResult {
  questionIndex: number
  questionText: string
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
  explanation: string
  options: string[]
}

interface QuizResultsData {
  success: boolean
  score: number
  correctAnswers: number
  totalQuestions: number
  results: QuizResult[]
}

export default function QuizPage({ params }: { params: { courseId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { courseId } = params

  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<QuizResultsData | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [courseName, setCourseName] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchQuiz()
    }
  }, [status, courseId, router])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      
      // Fetch course details first
      const courseResponse = await fetch('/api/courses/user')
      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        const course = courseData.courses?.find((c: any) => c.course_id === courseId)
        if (course) {
          setCourseName(course.title)
        }
      }

      // Fetch quiz
      const response = await fetch(`/api/quizzes/${courseId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Quiz not found for this course')
          router.push('/assessments')
          return
        }
        throw new Error('Failed to fetch quiz')
      }

      const data = await response.json()
      setQuizData(data)
      
      // If user already has an attempt, show results
      if (data.hasAttempt && data.attempt) {
        const attemptResponse = await fetch(`/api/quizzes/${courseId}/attempt`)
        if (attemptResponse.ok) {
          const attemptData = await attemptResponse.json()
          setResults({
            success: true,
            score: attemptData.attempt.score,
            correctAnswers: attemptData.attempt.correctCount,
            totalQuestions: attemptData.attempt.totalQuestions,
            results: attemptData.results
          })
          setShowResults(true)
        }
      } else {
        // Initialize answers array for new quiz
        setAnswers(new Array(data.quiz.questions.length).fill(-1))
      }
    } catch (error) {
      console.error('Error fetching quiz:', error)
      toast.error('Failed to load quiz')
      router.push('/assessments')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < (quizData?.quiz.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quizData) return

    // Check if all questions are answered
    const unansweredQuestions = answers.findIndex(answer => answer === -1)
    if (unansweredQuestions !== -1) {
      toast.error(`Please answer question ${unansweredQuestions + 1} before submitting`)
      setCurrentQuestion(unansweredQuestions)
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/quizzes/${courseId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const resultsData = await response.json()
      setResults(resultsData)
      setShowResults(true)
      
      toast.success(`Quiz completed! Your score: ${resultsData.score}%`)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetakeQuiz = () => {
    // For now, just show message that retaking is not allowed
    toast.error('Retaking quizzes is not allowed. You can only review your previous attempt.')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Quiz Not Found</h3>
            <p className="text-gray-600 mb-4">The quiz for this course could not be found.</p>
            <Button onClick={() => router.push('/assessments')}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Trophy className={`h-12 w-12 ${getScoreColor(results.score)}`} />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Quiz Results
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {courseName}
              </p>
            </div>

            {/* Score Overview */}
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className={`text-6xl font-bold ${getScoreColor(results.score)} mb-2`}>
                    {results.score}%
                  </div>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    {results.correctAnswers} out of {results.totalQuestions} correct
                  </p>
                </div>
                
                <div className="flex justify-center space-x-4 mb-6">
                  <Badge variant={getScoreBadgeVariant(results.score)} className="text-lg px-4 py-2">
                    {results.score >= 80 ? 'Excellent!' : 
                     results.score >= 60 ? 'Good Job!' : 'Keep Learning!'}
                  </Badge>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button onClick={handleRetakeQuiz} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button onClick={() => {
                    router.push('/assessments')
                  }}>
                    Back to Assessments
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Detailed Results
              </h2>
              
              {results.results.map((result, index) => (
                <Card key={index} className={`border-l-4 ${
                  result.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        {result.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span>Question {index + 1}</span>
                      </CardTitle>
                      <Badge variant={result.isCorrect ? 'default' : 'destructive'}>
                        {result.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    <CardDescription className="text-base font-medium">
                      {result.questionText}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      {result.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === result.correctAnswer
                              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                              : optionIndex === result.userAnswer && !result.isCorrect
                              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                              : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {optionIndex === result.correctAnswer && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {optionIndex === result.userAnswer && !result.isCorrect && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {result.explanation && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                          Explanation:
                        </p>
                        <p className="text-blue-700 dark:text-blue-400">
                          {result.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / quizData.quiz.questions.length) * 100
  const currentQ = quizData.quiz.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/assessments')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Assessments</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {courseName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Assessment</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{currentQuestion + 1} of {quizData.quiz.questions.length}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">
                Question {currentQuestion + 1}
              </CardTitle>
              <CardDescription className="text-lg font-medium text-gray-900 dark:text-white">
                {currentQ.questionText}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <RadioGroup
                value={answers[currentQuestion]?.toString() || ''}
                onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
                className="space-y-4"
              >
                {currentQ.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-2">
              {quizData.quiz.questions.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[index] !== -1
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === quizData.quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || answers.includes(-1)}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Quiz</span>
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentQuestion === quizData.quiz.questions.length - 1}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Answer Status */}
          {answers.includes(-1) && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800 dark:text-yellow-300">
                  {answers.filter(a => a === -1).length} question(s) remaining
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}