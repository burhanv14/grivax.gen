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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Enrolled Courses</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href={userId ? `/courses/${userId}` : '#'}>Browse More Courses</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden relative">
            {course.isCompleted && (
              <div className="absolute right-2 top-2 z-10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="h-32 w-full sm:h-auto sm:w-1/3">
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    width={150}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h4 className="mb-1 line-clamp-1 font-medium">{course.title}</h4>
                    <div className="mb-2 flex items-center gap-2">
                      <Progress 
                        value={course.progress} 
                        className={`h-2 flex-1 ${course.isCompleted ? 'bg-primary/20' : ''}`} 
                      />
                      <span className="text-xs font-medium">{course.progress}%</span>
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground">Last activity: {course.lastActivity}</p>
                    <p className="text-xs">
                      {course.isCompleted ? (
                        <span className="text-primary font-medium">Course Completed!</span>
                      ) : (
                        <>
                          Next: <span className="font-medium">{course.nextLesson}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="mt-3">
                    <Button size="sm" asChild>
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

