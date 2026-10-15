import { BookOpen, GraduationCap, LineChart, Trophy, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EnrolledCourses from "@/components/enrolled-courses"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"

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
    redirect("/login?callbackUrl=" + encodeURIComponent("/dashboard/[user_id]"))
  }

  // Find user in database by email
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser) {
    redirect("/login?callbackUrl=" + encodeURIComponent("/dashboard/[user_id]"))
  }

  // Verify the user is accessing their own dashboard
  if (dbUser.user_id !== params.user_id) {
    redirect("/login?callbackUrl=" + encodeURIComponent("/dashboard/[user_id]"))
  }

  // Fetch user's courses with progress
  let courses = await prisma.course.findMany({
    where: {
      user_id: dbUser.user_id,
    },
    include: {
      units: {
        include: {
          chapters: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })
  if (courses.length > 4) {
    courses = courses.slice(0, 4);
  }
  // Format courses for the EnrolledCourses component
  const enrolledCourses = courses.map(course => {
    const totalChapters = course.units.reduce((acc, unit) => acc + unit.chapters.length, 0)
    const completedChapters = course.units.reduce((acc, unit) => 
      acc + unit.chapters.filter(ch => ch.isCompleted).length, 0
    )
    const progress = Math.round((completedChapters / totalChapters) * 100)
    const isCompleted = progress === 100

    // Find the next incomplete chapter
    let nextLesson = "Course Completed"
    if (!isCompleted) {
      for (const unit of course.units) {
        const incompleteChapter = unit.chapters.find(ch => !ch.isCompleted)
        if (incompleteChapter) {
          nextLesson = incompleteChapter.name
          break
        }
      }
    }

    return {
      id: course.course_id,
      title: course.title,
      image: course.image,
      progress,
      lastActivity: new Date(course.updatedAt).toLocaleDateString(),
      nextLesson,
      isCompleted
    }
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {dbUser.name || 'Learner'}!</h1>
            <p className="text-muted-foreground">Track your learning progress and achievements</p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary/10 text-primary">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">{dbUser.role?.toLowerCase() || 'Student'}</span>
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
              {Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length || 0)}%
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