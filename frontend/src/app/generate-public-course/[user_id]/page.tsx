"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Filter, BookOpen, Search } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface GeneratePublicCoursesPageProps {
  params: {
    user_id: string
  }
}

export default function GeneratePublicCoursesPage({ params }: GeneratePublicCoursesPageProps) {
  const router = useRouter()
  const [inputs, setInputs] = useState({
    topic: "",
    difficulty: "beginner",
    pace: "4",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)

  const handleSubmit = async () => {
    if (!inputs.topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    try {
      setLoading(true)
      setError("")
      setProgress(0)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 1000)

      const response = await fetch(`/api/generate-public-course/${params.user_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...inputs,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate public course")
      }

      const data = await response.json()
      
      if (data.success && data.redirectUrl) {
        router.push(data.redirectUrl)
      } else {
        throw new Error(data.error || "Failed to generate public course")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setProgress(0)
      toast.error(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 md:px-6 md:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Generate Public Course
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create a comprehensive public course that students can enroll in. 
            The course will be generated with detailed content that you can then edit and customize.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Course Generation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium mb-2">
                      Course Topic *
                    </label>
                    <Input
                      id="topic"
                      placeholder="e.g., Introduction to Machine Learning, Web Development Fundamentals"
                      value={inputs.topic}
                      onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium mb-2">
                        Difficulty Level
                      </label>
                      <Select
                        value={inputs.difficulty}
                        onValueChange={(value) => setInputs({ ...inputs, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="pace" className="block text-sm font-medium mb-2">
                        Course Duration (weeks)
                      </label>
                      <Select
                        value={inputs.pace}
                        onValueChange={(value) => setInputs({ ...inputs, pace: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 weeks</SelectItem>
                          <SelectItem value="4">4 weeks</SelectItem>
                          <SelectItem value="6">6 weeks</SelectItem>
                          <SelectItem value="8">8 weeks</SelectItem>
                          <SelectItem value="12">12 weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Generating your public course...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !inputs.topic.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Course...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Generate Public Course
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">What happens next?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>AI generates a complete course structure with modules and chapters</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>You can review and customize the generated content</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Add YouTube videos and reading materials to each chapter</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Publish the course for students to enroll</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Course Features</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Structured learning modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <span>Student enrollment system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <span>Progress tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
