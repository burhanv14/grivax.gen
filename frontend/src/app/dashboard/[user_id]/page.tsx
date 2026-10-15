import { BookOpen, GraduationCap, LineChart, Trophy, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EnrolledCourses from "@/components/enrolled-courses"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BACKEND_URL } from "@/lib/backend"

export const metadata = {
  title: "Dashboard | Grivax",
  description: "Track your learning progress and achievements",
}

export default async function DashboardPage({
  params,
}: {
  params: { user_id: string }
}) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=" + encodeURIComponent(`/dashboard/${params.user_id}`))
  }

  // Fetch courses from Java backend
  let courses: any[] = []
  try {
    const res = await fetch(`${BACKEND_URL}/api/courses/${params.user_id}`, {
      cache: "no-store",
    })
    if (res.ok) {
      courses = await res.json()
    }
  } catch (error) {
    console.error("Error fetching dashboard courses:", error)
  }

  const displayCourses = courses.slice(0, 4)

  // Format courses for the EnrolledCourses component
  const enrolledCourses = displayCourses.map((course: any) => {
    const units = course.units || []
    const totalChapters = units.reduce((acc: number, unit: any) => acc + (unit.chapters ? unit.chapters.length : 0), 0)
    const completedChapters = units.reduce((acc: number, unit: any) => 
      acc + (unit.chapters ? unit.chapters.filter((ch: any) => ch.isCompleted).length : 0), 0
    )
    const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
    const isCompleted = progress === 100

    // Find the next incomplete chapter
    let nextLesson = "Course Completed"
    if (!isCompleted) {
      for (const unit of units) {
        if (unit.chapters) {
          const incompleteChapter = unit.chapters.find((ch: any) => !ch.isCompleted)
          if (incompleteChapter) {
            nextLesson = incompleteChapter.name
            break
          }
        }
      }
    }

    return {
      id: course.course_id,
      title: course.title,
      image: course.image,
      progress,
      lastActivity: course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : new Date().toLocaleDateString(),
      nextLesson,
      isCompleted
    }
  })

  const userName = session.user?.name || "Learner"
  const userRole = session.user?.role || "STUDENT"

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
            <p className="text-muted-foreground">Track your learning progress and achievements</p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary/10 text-primary">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">{userRole.toLowerCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrolledCourses.filter(course => course.isCompleted).length}
            </div>
            <p className="text-xs text-muted-foreground">Finished learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrolledCourses.filter(course => !course.isCompleted).length}
            </div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <EnrolledCourses courses={enrolledCourses} />
      </div>
    </div>
  )
}