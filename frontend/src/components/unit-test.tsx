"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, Trophy, AlertCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface Question {
  id: number
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: string
  explanation: string
}

interface TestData {
  test_id: string
  questions: Question[]
  hasAttempted: boolean
  userAttempt: {
    score: number
    correctCount: number
    totalQuestions: number
    completedAt: string
  } | null
}

interface UnitTestProps {
  unitId: string
  userId: string
  unitName: string
  allChaptersCompleted: boolean
}

export default function UnitTest({ unitId, userId, unitName, allChaptersCompleted }: UnitTestProps) {
  const [testData, setTestData] = useState<TestData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [testScore, setTestScore] = useState<{
    score: number
    correctCount: number
    totalQuestions: number
  } | null>(null)

  useEffect(() => {
    fetchTestData()
  }, [unitId, userId])

  const fetchTestData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/test/${unitId}?user_id=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setTestData(data.test)
        if (data.test.hasAttempted) {
          setShowResults(true)
          setTestScore({
            score: data.test.userAttempt.score,
            correctCount: data.test.userAttempt.correctCount,
            totalQuestions: data.test.userAttempt.totalQuestions
          })
        }
      } else {
        toast.error("Failed to load test")
      }
    } catch (error) {
      console.error("Error fetching test data:", error)
      toast.error("Failed to load test")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitTest = async () => {
    if (!testData) return

    const answeredQuestions = Object.keys(answers).length
    if (answeredQuestions < testData.questions.length) {
      toast.error("Please answer all questions before submitting")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/test-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test_id: testData.test_id,
          user_id: userId,
          answers: testData.questions.map(q => ({
            questionId: q.id,
            answer: answers[q.id] || ""
          }))
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTestScore({
          score: data.attempt.score,
          correctCount: data.attempt.correctCount,
          totalQuestions: data.attempt.totalQuestions
        })
        setShowResults(true)
        toast.success("Test submitted successfully!")
        
        // Update test data to reflect the attempt
        setTestData(prev => prev ? {
          ...prev,
          hasAttempted: true,
          userAttempt: {
            score: data.attempt.score,
            correctCount: data.attempt.correctCount,
            totalQuestions: data.attempt.totalQuestions,
            completedAt: data.attempt.completedAt
          }
        } : null)
      } else {
        toast.error(data.error || "Failed to submit test")
      }
    } catch (error) {
      console.error("Error submitting test:", error)
      toast.error("Failed to submit test")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetTest = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setTestScore(null)
    
    // Reset the test data to allow retaking
    if (testData) {
      setTestData(prev => prev ? {
        ...prev,
        hasAttempted: false,
        userAttempt: null
      } : null)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading test...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!testData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Test not available for this unit.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showResults && testScore) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Test Results
          </CardTitle>
          <CardDescription>
            Unit: {unitName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {testScore.score}%
            </div>
            <div className="text-lg text-muted-foreground">
              {testScore.correctCount} out of {testScore.totalQuestions} correct
            </div>
            <Progress 
              value={testScore.score} 
              className="w-full max-w-xs mx-auto"
            />
          </div>
          
          <Separator />
          
          <div className="text-center">
            <Badge 
              variant={testScore.score >= 50 ? "default" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {testScore.score >= 50 ? "Passed" : "Failed"}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              {testScore.score >= 50 
                ? "Great job! You've mastered this unit." 
                : "Review the unit content and try again when ready."
              }
            </p>
            
            {testScore.score < 50 && (
              <Button 
                onClick={resetTest}
                className="mt-4"
                variant="outline"
              >
                Retake Test
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Unit Test
        </CardTitle>
        <CardDescription>
          {unitName} - {testData.questions.length} questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!allChaptersCompleted ? (
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold">Complete All Chapters First</h3>
              <p className="text-muted-foreground">
                You need to complete all chapters in this unit before taking the test.
              </p>
            </div>
          </div>
        ) : testData.hasAttempted && testData.userAttempt && testData.userAttempt.score >= 50 ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Test Already Passed</h3>
              <p className="text-muted-foreground">
                You have already passed this test. Score: {testData.userAttempt?.score}%
              </p>
            </div>
          </div>
        ) : testData.hasAttempted && testData.userAttempt && testData.userAttempt.score < 50 ? (
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <div>
              <h3 className="text-lg font-semibold">Test Failed - Retry Available</h3>
              <p className="text-muted-foreground">
                Previous score: {testData.userAttempt?.score}%. You can retake the test to improve your score.
              </p>
              <Button 
                onClick={resetTest}
                className="mt-4"
              >
                Retake Test
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestion + 1} of {testData.questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / testData.questions.length) * 100)}%</span>
              </div>
              <Progress 
                value={((currentQuestion + 1) / testData.questions.length) * 100} 
                className="w-full"
              />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">
                  {testData.questions[currentQuestion].question}
                </h3>
                
                <div className="space-y-2">
                  {Object.entries(testData.questions[currentQuestion].options).map(([key, value]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        answers[testData.questions[currentQuestion].id] === key
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      onClick={() => handleAnswerSelect(testData.questions[currentQuestion].id, key)}
                    >
                      <span className="font-medium mr-2">{key}.</span>
                      {value}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              {currentQuestion < testData.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={!answers[testData.questions[currentQuestion].id]}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting || !answers[testData.questions[currentQuestion].id]}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit Test
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
