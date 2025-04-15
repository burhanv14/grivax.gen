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
        const response = await fetch(`/api/generate-course/${params.course_id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch course data")
        }
        const data = await response.json()
        if (!data.courseStructure || !data.courseStructure.modules) {
          throw new Error("Invalid course data structure")
        }
        setCourseData(data)
        console.log(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (params.course_id) {
      fetchCourseData()
    }
  }, [params.course_id])

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

  // ... rest of the component code stays the same ...
} 