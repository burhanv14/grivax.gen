"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface EnrolledCourse {
  id: string
  title: string
  image: string
  progress: number
  lastActivity: string
  nextLesson: string
  isCompleted: boolean
}

interface EnrolledCoursesProps {
  courses: EnrolledCourse[]
}

export default function EnrolledCourses({ courses }: EnrolledCoursesProps) {
  const { data: session } = useSession()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserId = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user?email=${encodeURIComponent(session.user.email)}`)
          if (response.ok) {
            const data = await response.json()
            if (data.user_id) {
              setUserId(data.user_id)
            }
          }
        } catch (error) {
          console.error("Error fetching user ID:", error)
        }
      }
    }

    fetchUserId()
  }, [session?.user?.email])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold tracking-tight">Enrolled Courses</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href={userId ? `/courses/${userId}` : '#'}>Browse More Courses</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id} className="group relative overflow-hidden border bg-background transition-all hover:shadow-md">
            {course.isCompleted && (
              <div className="absolute right-3 top-3 z-10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            )}
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:h-[180px]">
                <div className="relative h-48 w-full sm:h-full sm:w-[240px]">
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 240px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold tracking-tight text-lg">{course.title}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={course.progress} 
                          className={`h-2 flex-1 ${course.isCompleted ? 'bg-primary/20' : ''}`} 
                        />
                        <span className="text-sm font-medium">{course.progress}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Last activity: {course.lastActivity}</p>
                      <p className="text-sm">
                        {course.isCompleted ? (
                          <span className="text-primary font-medium">Course Completed!</span>
                        ) : (
                          <>
                            Next: <span className="font-medium">{course.nextLesson}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button size="sm" className="w-full sm:w-auto" asChild>
                      <Link href={userId ? `/courses/${userId}/${course.id}` : '#'}>
                        {course.isCompleted ? 'Review Course' : 'Continue'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

