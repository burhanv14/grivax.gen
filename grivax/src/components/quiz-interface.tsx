"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Mock data - would be fetched from an API in a real application
const quizQuestions = [
  {
    id: "1",
    question: "What is the primary goal of supervised learning?",
    options: [
      {
        id: "a",
        text: "To find patterns in unlabeled data",
      },
      {
        id: "b",
        text: "To predict outcomes based on labeled training data",
      },
      {
        id: "c",
        text: "To cluster similar data points together",
      },
      {
        id: "d",
        text: "To reduce the dimensionality of the data",
      },
    ],
    correctAnswer: "b",
  },
  {
    id: "2",
    question: "Which of the following is NOT a type of machine learning?",
    options: [
      {
        id: "a",
        text: "Supervised learning",
      },
      {
        id: "b",
        text: "Unsupervised learning",
      },
      {
        id: "c",
        text: "Reinforcement learning",
      },
      {
        id: "d",
        text: "Deterministic learning",
      },
    ],
    correctAnswer: "d",
  },
  {
    id: "3",
    question: "What is the purpose of the activation function in a neural network?",
    options: [
      {
        id: "a",
        text: "To initialize the weights of the network",
      },
      {
        id: "b",
        text: "To calculate the loss of the model",
      },
      {
        id: "c",
        text: "To introduce non-linearity into the network",
      },
      {
        id: "d",
        text: "To normalize the input data",
      },
    ],
    correctAnswer: "c",
  },
]

interface QuizInterfaceProps {
  quizId: string
}

export default function QuizInterface({ quizId }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(1200) // 20 minutes in seconds

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const calculateScore = () => {
    let correctCount = 0
    quizQuestions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })
    return {
      score: correctCount,
      total: quizQuestions.length,
      percentage: Math.round((correctCount / quizQuestions.length) * 100),
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (showResults) {
    const result = calculateScore()
    return (
      <Card className="border-2 border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-5xl font-bold">{result.percentage}%</div>
            <p className="text-muted-foreground">
              You got {result.score} out of {result.total} questions correct
            </p>
          </div>

          <div className="space-y-4">
            {quizQuestions.map((question, index) => {
              const isCorrect = selectedAnswers[question.id] === question.correctAnswer
              return (
                <div
                  key={question.id}
                  className={`rounded-lg border p-4 ${
                    isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-red-500 bg-red-50 dark:bg-red-950/20"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isCorrect
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </div>
                  </div>
                  <p className="mb-3">{question.question}</p>
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={`rounded-md p-2 ${
                          option.id === question.correctAnswer
                            ? "bg-green-100 dark:bg-green-900/30"
                            : option.id === selectedAnswers[question.id] && option.id !== question.correctAnswer
                              ? "bg-red-100 dark:bg-red-900/30"
                              : "bg-muted"
                        }`}
                      >
                        {option.text}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.reload()}>Retake Quiz</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Question {currentQuestionIndex + 1} of {quizQuestions.length}
        </CardTitle>
        <div className="flex items-center gap-1 text-sm font-medium">
          <Clock className="h-4 w-4" />
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="h-2" />

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{currentQuestion.question}</h3>

          <RadioGroup
            value={selectedAnswers[currentQuestion.id] || ""}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-accent"
              >
                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion.id]}>
          {currentQuestionIndex < quizQuestions.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Finish Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

