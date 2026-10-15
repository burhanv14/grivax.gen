import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data - would be fetched from an API in a real application
const allQuizzes = [
  {
    id: "1",
    title: "Machine Learning Fundamentals",
    description: "Test your knowledge of machine learning basics",
    image: "/placeholder.svg?height=200&width=300",
    difficulty: "Beginner",
    questions: 20,
    duration: "20 min",
    attempts: 1245,
    tag: "Popular",
    category: ["popular", "beginner"],
  },
  {
    id: "2",
    title: "Advanced JavaScript Concepts",
    description: "Challenge yourself with advanced JavaScript questions",
    image: "/placeholder.svg?height=200&width=300",
    difficulty: "Advanced",
    questions: 25,
    duration: "30 min",
    attempts: 987,
    tag: "New",
    category: ["new", "advanced"],
  },
  {
    id: "3",
    title: "Data Science Essentials",
    description: "Test your knowledge of data science fundamentals",
    image: "/placeholder.svg?height=200&width=300",
    difficulty: "Intermediate",
    questions: 15,
    duration: "15 min",
    attempts: 1532,
    tag: "Trending",
    category: ["popular", "intermediate"],
  },
  {
    id: "4",
    title: "Web Development Basics",
    description: "Test your knowledge of HTML, CSS, and JavaScript",
    image: "/placeholder.svg?height=200&width=300",
    difficulty: "Beginner",
    questions: 30,
    duration: "25 min",
    attempts: 876,
    category: ["beginner"],
  },
  {
    id: "5",
    title: "AI Ethics and Implications",
    description: "Test your understanding of ethical considerations in AI",
    image: "/placeholder.svg?height=200&width=300",
    difficulty: "Advanced",
    questions: 15,
    duration: "20 min",
    attempts: 632,
    category: ["new", "advanced"],
  },
  {
    id: "6",
    title: "Blockchain Fundamentals",
    description: "Test your knowledge of blockchain technology",
    image: "/placeholder.svg?height=200&width=300",
    difficulty: "Intermediate",
    questions: 20,
    duration: "25 min",
    attempts: 754,
    tag: "Hot",
    category: ["popular", "intermediate"],
  },
]

interface QuizGridProps {
  filter?: string
}

export default function QuizGrid({ filter }: QuizGridProps) {
  // Filter quizzes based on the selected filter
  const filteredQuizzes = filter ? allQuizzes.filter((quiz) => quiz.category.includes(filter)) : allQuizzes

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredQuizzes.map((quiz) => (
        <Card key={quiz.id} className="group overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="relative">
            <Image
              src={quiz.image || "/placeholder.svg"}
              alt={quiz.title}
              width={300}
              height={200}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {quiz.tag && <Badge className="absolute right-2 top-2 bg-primary">{quiz.tag}</Badge>}
          </div>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="outline">{quiz.difficulty}</Badge>
              <span className="text-sm text-muted-foreground">{quiz.duration}</span>
            </div>
            <h3 className="mb-2 line-clamp-1 font-poppins text-xl font-semibold">{quiz.title}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{quiz.description}</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{quiz.questions} questions</span>
              <span className="text-xs text-muted-foreground">({quiz.attempts} attempts)</span>
            </div>
            <Link href={`/quizzes/${quiz.id}`} className="text-sm font-medium text-primary hover:underline">
              Take Quiz
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

