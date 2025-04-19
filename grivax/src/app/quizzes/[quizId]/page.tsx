import { ArrowLeft, Clock, Star, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import QuizInterface from "@/components/quiz-interface"

export default function QuizPage({ params }: { params: { quizId: string } }) {
  // This would be fetched from an API in a real application
  const quiz = {
    id: params.quizId,
    title: "Machine Learning Fundamentals",
    description:
      "Test your knowledge of machine learning fundamentals with this comprehensive quiz. Covers basic concepts, algorithms, and practical applications.",
    creator: "Grivax AI",
    rating: 4.7,
    attempts: 1876,
    duration: "20 minutes",
    difficulty: "Intermediate",
    questions: 15,
    image: "/placeholder.svg?height=400&width=600",
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <Link
        href="/quizzes"
        className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Quizzes
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 overflow-hidden rounded-xl">
            <Image
              src={quiz.image || "/placeholder.svg"}
              alt={quiz.title}
              width={800}
              height={450}
              className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="mb-8">
            <h1 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl">{quiz.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-medium">{quiz.rating}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-1 h-4 w-4" />
                <span>{quiz.attempts.toLocaleString()} attempts</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                <span>{quiz.duration}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-4 w-4"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
                <span>{quiz.questions} questions</span>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">{quiz.description}</p>
          </div>

          <QuizInterface quizId={quiz.id} />
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-xl border bg-background p-6 shadow-sm dark:bg-muted/50">
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Creator</span>
                <span className="font-medium">{quiz.creator}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-medium">{quiz.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Difficulty</span>
                <span className="font-medium">{quiz.difficulty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Questions</span>
                <span className="font-medium">{quiz.questions}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full">Start Quiz</Button>
              <Button variant="outline" className="w-full">
                Save for Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

