"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Users, 
  Eye,
  Edit,
  Save,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface CourseModule {
  week: number
  title: string
  objectives: string[]
  timeSpent: string
}

interface CourseData {
  course_id: string
  courseStructure: {
    title: string
    description: string
    modules: CourseModule[]
  }
}

function ModuleCard({ module, index }: { module: CourseModule; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{module.title}</h3>
          <p className="text-sm text-muted-foreground">Week {module.week}</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {module.timeSpent}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Learning Objectives:</h4>
        <ul className="space-y-1">
          {module.objectives.map((objective, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default function GeneratePublicCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/generate-course/${params.user_id}/${params.course_id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch course data")
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
            modules: data.modules,
          },
        }

        setCourseData(formattedData)
      } catch (err) {
        console.error("Error in fetchCourseData:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (params.user_id && params.course_id) {
      fetchCourseData()
    }
  }, [params.course_id, params.user_id])

  const handleConvertToPublicCourse = async () => {
    if (!courseData) return

    setIsConverting(true)
    try {
      const response = await fetch(`/api/convert-to-public-course/${params.user_id}/${params.course_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseData.courseStructure.title,
          description: courseData.courseStructure.description,
          modules: courseData.courseStructure.modules
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Course converted to public course successfully!")
        router.push(`/public-courses/${data.public_course_id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to convert course")
      }
    } catch (error) {
      console.error("Error converting course:", error)
      toast.error("Failed to convert course")
    } finally {
      setIsConverting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-muted-foreground">Loading course data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Course not found</div>
        </div>
      </div>
    )
  }

  const totalWeeks = courseData.courseStructure.modules.length
  const totalObjectives = courseData.courseStructure.modules.reduce(
    (total, module) => total + module.objectives.length, 
    0
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{courseData.courseStructure.title}</h1>
            <p className="text-muted-foreground">{courseData.courseStructure.description}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Generated Course
          </Badge>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalWeeks}</p>
                <p className="text-sm text-muted-foreground">Weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalObjectives}</p>
                <p className="text-sm text-muted-foreground">Learning Objectives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Students (After Publishing)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Modules */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Course Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {courseData.courseStructure.modules.map((module, index) => (
              <ModuleCard key={index} module={module} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/courses/${params.user_id}`)}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleConvertToPublicCourse}
          disabled={isConverting}
          size="lg"
          className="px-8"
        >
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Convert to Public Course
            </>
          )}
        </Button>
      </div>

      {/* Information Panel */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">What happens when you convert to a public course?</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>The course will be created as a public course that students can enroll in</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>You can edit YouTube links and reading materials for each chapter</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>You can enroll students and track their progress</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>You can publish or keep the course as a draft</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
