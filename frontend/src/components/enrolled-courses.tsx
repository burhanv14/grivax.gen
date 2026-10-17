"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import type { EnrolledCourse } from "@/types"

export interface EnrolledCoursesProps {
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

  const effectiveUserId = userId || (session?.user as any)?.id || ""

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold tracking-tight">Enrolled Courses</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href={effectiveUserId ? `/courses/${effectiveUserId}` : '/courses'}>Browse More Courses</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="group relative flex h-full flex-col overflow-hidden border bg-background transition-all hover:shadow-md"
          >
            {course.isCompleted && (
              <div className="absolute right-3 top-3 z-10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            )}
            <CardContent className="flex flex-1 flex-col p-0 sm:flex-row">
              {/* Image: fixed height on mobile, stretches to card height on desktop */}
              <div className="relative h-48 w-full shrink-0 sm:h-auto sm:min-h-[180px] sm:w-[240px]">
                <Image
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 240px"
                />
              </div>

              {/* Content: grows with its content, button pinned to the bottom */}
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-6">
                <div className="space-y-4">
                  <h4 className="line-clamp-2 text-lg font-semibold tracking-tight pr-6">
                    {course.title}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={course.progress}
                        className={`h-2 flex-1 ${course.isCompleted ? "bg-primary/20" : ""}`}
                      />
                      <span className="text-sm font-medium">{course.progress}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last activity: {course.lastActivity}
                    </p>
                    <p className="line-clamp-1 text-sm">
                      {course.isCompleted ? (
                        <span className="font-medium text-primary">Course Completed!</span>
                      ) : (
                        <>
                          Next: <span className="font-medium">{course.nextLesson}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Button size="sm" className="w-full sm:w-auto" asChild>
                    <Link href={effectiveUserId ? `/courses/${effectiveUserId}/${course.id}` : `/courses`}>
                      {course.isCompleted ? "Review Course" : "Continue"}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

