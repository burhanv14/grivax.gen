import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { loginIsRequiredServer, authConfig } from "@/lib/auth"
import Link from "next/link"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { Course3DCard } from "@/components/course-3d-card"

export const metadata = {
  title: "3D Courses View | Grivax.gen",
  description: "Browse our collection of dynamic, AI-generated courses in 3D",
}

// Define the Course type
interface Course {
  course_id: string
  title: string
  image: string
}

export default async function Courses3DPage({ params }: { params: { user_id: string } }) {
  await loginIsRequiredServer()

  // Get current user from session
  const session = await getServerSession(authConfig)
  let userId = params.user_id

  try {
    if (session?.user?.email) {
      // Find user in database by email
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (dbUser) {
        // Verify the user is accessing their own courses
        if (dbUser.user_id !== userId) {
          userId = dbUser.user_id
        }
      }
    }
  } catch (error) {
    console.error("Error getting current user:", error)
  }

  // Fetch user courses from the database
  const userCourses: Course[] = await prisma.course.findMany({
    where: {
      user_id: userId,
    },
    select: {
      course_id: true,
      title: true,
      image: true,
    },
  })

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">3D Course Gallery</h1>
          <p className="max-w-[700px] text-muted-foreground">Explore your courses in an immersive 3D environment.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/courses/${userId}`}>Standard View</Link>
          </Button>
          <Button asChild className="sm:self-start" size="lg">
            <Link href={`/generate-courses/${userId}`}>
              <Plus className="mr-2 h-5 w-5" />
              Add New Course
            </Link>
          </Button>
        </div>
      </div>

      {/* 3D Courses Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">My 3D Courses</h2>
        </div>

        {userCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {userCourses.map((course) => (
              <Course3DCard key={course.course_id} course={course} userId={userId} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No courses created yet</h3>
            <p className="text-muted-foreground mb-4">Start creating your first course by clicking the button above.</p>
            <Button asChild>
              <Link href={`/generate-courses/${userId}`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Course
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
