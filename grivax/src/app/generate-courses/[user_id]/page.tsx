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

interface GenerateCoursesPageProps {
  params: {
    user_id: string
  }
}

export default function GenerateCoursesPage({ params }: GenerateCoursesPageProps) {
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

      const response = await fetch(`/api/generate-course/${params.user_id}`, {
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
        throw new Error(errorData.error || "Failed to generate course")
      }

      const data = await response.json()
      
      if (data.success && data.redirectUrl) {
        router.push(data.redirectUrl)
      } else {
        throw new Error(data.error || "Failed to generate course")
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
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">What can I help you learn?</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Enter a topic below to generate a personalized course for it
          </p>
        </div>

        <Card className="mb-6 shadow-sm border-2">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  value={inputs.topic}
                  onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                  placeholder="e.g. JavaScript Promises, React Hooks, Go Routines etc"
                  className="w-full text-base md:text-lg py-6 pl-5 pr-5 rounded-lg border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
                <div className="flex flex-col space-y-3 ">
                  <label className="text-sm font-medium text-muted-foreground pl-1">Difficulty Level</label>
                  <Select
                    value={inputs.difficulty}
                    onValueChange={(value) => setInputs({ ...inputs, difficulty: value })}
                  >
                    <SelectTrigger className="w-full h-11 dark:bg-slate-900">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Course Duration</label>
                  <div className="relative flex items-center">
                    <div className="flex items-center h-11 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full">
                      <button 
                        type="button"
                        onClick={() => {
                          const currentValue = parseInt(inputs.pace);
                          if (currentValue > 1) {
                            setInputs({ ...inputs, pace: (currentValue - 1).toString() });
                          }
                        }}
                        className="h-full w-12 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Decrease duration"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300">
                          <path d="M5 12h14"></path>
                        </svg>
                      </button>
                      <div className="flex items-center justify-center min-w-[50px]">
                        <input
                          id="duration"
                          type="number"
                          min="1"
                          max="52"
                          value={inputs.pace}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 52)) {
                              setInputs({ ...inputs, pace: value });
                            }
                          }}
                          className="w-full text-center py-1 focus:outline-none bg-transparent text-lg font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="h-full px-3 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                        weeks
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const currentValue = parseInt(inputs.pace);
                          if (currentValue < 52) {
                            setInputs({ ...inputs, pace: (currentValue + 1).toString() });
                          }
                        }}
                        className="h-full w-12 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Increase duration"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300">
                          <path d="M12 5v14"></path>
                          <path d="M5 12h14"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="absolute -bottom-5 left-0 text-xs text-slate-500 dark:text-slate-400">
                      Recommended: 4-12 weeks
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !inputs.topic.trim()}
                    className="w-full h-11 transition-all"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Generate Course
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {loading && (
                <div className="space-y-4">
                  <Progress value={progress} className="w-full h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {progress < 90 ? "Generating your personalized course..." : "Finalizing your course..."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/30 rounded-lg p-4 text-sm backdrop-blur-sm">
          <p className="flex items-center">
            <span className="text-amber-500 dark:text-amber-400 mr-2">💡</span>
            <span>
              <strong className="font-medium mr-1">Pro tip:</strong>
              <span className="text-slate-700 dark:text-slate-300">
                Use specific topics like "JavaScript Promises" or "Go Routines" instead of "JavaScript" or "Go" for
                better results
              </span>
            </span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/30 text-red-700 dark:text-red-400 px-5 py-4 rounded-lg mb-8 backdrop-blur-sm">
          {error}
        </div>
      )}

      <Separator className="my-12" />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            type="search"
            placeholder="Search courses..."
            className="pr-10 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        </div>
        <Button variant="outline" size="sm" className="sm:ml-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-12">
        <TabsList className="mb-6 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <TabsTrigger value="all" className="rounded-md">All Courses</TabsTrigger>
          <TabsTrigger value="popular" className="rounded-md">Popular</TabsTrigger>
          <TabsTrigger value="new" className="rounded-md">New</TabsTrigger>
          <TabsTrigger value="beginner" className="rounded-md">Beginner</TabsTrigger>
          <TabsTrigger value="advanced" className="rounded-md">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Course cards will be populated here */}
          </div>
        </TabsContent>
        <TabsContent value="popular">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Popular courses will be populated here */}
          </div>
        </TabsContent>
        <TabsContent value="new">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* New courses will be populated here */}
          </div>
        </TabsContent>
        <TabsContent value="beginner">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Beginner courses will be populated here */}
          </div>
        </TabsContent>
        <TabsContent value="advanced">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Advanced courses will be populated here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
