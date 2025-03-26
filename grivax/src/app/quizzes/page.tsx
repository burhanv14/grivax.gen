import { Filter } from "lucide-react"
import QuizGrid from "@/components/quiz-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = {
  title: "Quizzes | Grivax.gen",
  description: "Test your knowledge with our dynamic, AI-generated quizzes",
}

export default function QuizzesPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 space-y-2">
        <h1 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Challenge Yourself</h1>
        <p className="max-w-[700px] text-muted-foreground">
          Test your knowledge with our adaptive quizzes that identify your strengths and areas for improvement.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Input type="search" placeholder="Search quizzes..." className="pr-10" />
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
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <Button variant="outline" size="sm" className="sm:ml-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Quizzes</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <QuizGrid />
        </TabsContent>
        <TabsContent value="popular">
          <QuizGrid filter="popular" />
        </TabsContent>
        <TabsContent value="new">
          <QuizGrid filter="new" />
        </TabsContent>
        <TabsContent value="beginner">
          <QuizGrid filter="beginner" />
        </TabsContent>
        <TabsContent value="advanced">
          <QuizGrid filter="advanced" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

