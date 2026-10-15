import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock data - would be fetched from an API in a real application
const quizResults = [
  {
    id: "1",
    title: "Machine Learning Fundamentals",
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    date: "May 15, 2023",
    duration: "18 minutes",
  },
  {
    id: "2",
    title: "JavaScript Basics",
    score: 92,
    totalQuestions: 25,
    correctAnswers: 23,
    date: "May 10, 2023",
    duration: "22 minutes",
  },
  {
    id: "3",
    title: "Data Structures and Algorithms",
    score: 78,
    totalQuestions: 15,
    correctAnswers: 12,
    date: "May 5, 2023",
    duration: "25 minutes",
  },
  {
    id: "4",
    title: "Web Development Fundamentals",
    score: 88,
    totalQuestions: 30,
    correctAnswers: 26,
    date: "April 28, 2023",
    duration: "35 minutes",
  },
]

export default function QuizResults() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Quiz Results</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href="/quizzes">Take New Quiz</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quizResults.map((result) => (
          <Card key={result.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="mb-1 font-medium">{result.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    Completed on {result.date} • {result.duration}
                  </p>
                </div>
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-lg font-bold">{result.score}%</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{result.correctAnswers}</span>/{result.totalQuestions} correct
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/quizzes/${result.id}`}>Review</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

