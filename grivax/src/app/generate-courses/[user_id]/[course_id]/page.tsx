"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Book, Target, Clock, FileText, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CourseModule {
  week: number
  title: string
  objectives: string[]
  resources: Array<{
    type: string
    title: string
    url: string
  }>
}

interface CourseData {
  course_id: string
  courseStructure: {
    title: string
    description: string
    modules: CourseModule[]
  }
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/generate-course/${params.user_id}/${params.course_id}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch course data')
        }
        
        if (!data.title || !data.modules) {
          throw new Error("Invalid course data structure")
        }
        
        // Format the data to match the expected structure
        const formattedData = {
          course_id: data.course_id,
          courseStructure: {
            title: data.title,
            description: data.description || "No description available",
            modules: data.modules
          }
        }
        
        setCourseData(formattedData)
      } catch (err) {
        console.error('Error in fetchCourseData:', err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (params.user_id && params.course_id) {
      fetchCourseData()
    }
  }, [params.course_id, params.user_id])

  const handleAccept = async () => {
    if (!courseData?.courseStructure?.modules) {
      toast.error('No course modules to save')
      return
    }

    setIsAccepting(true)
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: params.user_id,
          title: courseData.courseStructure.title,
          description: courseData.courseStructure.description,
          modules: courseData.courseStructure.modules,
          status: 'active'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save course')
      }

      toast.success('Course added to your collection!')
      router.push('/courses')
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save course')
    } finally {
      setIsAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">No course data available</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{courseData.courseStructure.title}</h1>
        <p className="text-gray-600">{courseData.courseStructure.description}</p>
      </div>

      <div className="space-y-6">
        {courseData.courseStructure.modules.map((module, index) => (
          <Card key={index} className="border rounded-lg shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Week {module.week}: {module.title}</CardTitle>
                <Badge variant="outline">Week {module.week}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Learning Objectives
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {module.objectives.map((objective, idx) => (
                      <li key={idx} className="text-gray-600">{objective}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Resources
                  </h3>
                  <div className="grid gap-2">
                    {module.resources.map((resource, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        {resource.type === 'video' ? (
                          <Video className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-500" />
                        )}
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {resource.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleAccept}
          disabled={isAccepting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isAccepting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Accept Course'
          )}
        </Button>
      </div>
    </div>
  )
} 