import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { loginIsRequiredServer, authConfig } from "@/lib/auth"
import Link from "next/link"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: { course_id: string } }) {
  const course = await prisma.course.findUnique({
    where: {
      course_id: params.course_id,
    },
  })

  if (!course) {
    return {
      title: "Course Not Found",
      description: "The requested course could not be found",
    }
  }

  return {
    title: `${course.title} | Grivax.gen`,
    description: `Learn ${course.title} with our AI-generated course`,
  }
}

export default async function CoursePage({
  params,
}: {
  params: { user_id: string; course_id: string }
}) {
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
        // Verify the user is accessing their own course
        if (dbUser.user_id !== userId) {
          userId = dbUser.user_id
        }
      }
    }
  } catch (error) {
    console.error("Error getting current user:", error)
  }

  // Fetch course details
  const course = await prisma.course.findUnique({
    where: {
      course_id: params.course_id,
      user_id: userId,
    },
    include: {
      units: true,
    },
  })

  if (!course) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <Button variant="ghost" asChild className="mb-8">
        <Link href={`/courses/${userId}`} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>

          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img
              src={course.image || "/placeholder.svg?height=400&width=600"}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Course content would go here */}
          <div className="prose dark:prose-invert max-w-none">
            <p>Course content is being prepared. Check back soon!</p>
          </div>
        </div>

        <div>
          <div className="sticky top-20">
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Course Units</h2>
              {course.units.length > 0 ? (
                <ul className="space-y-3">
                  {course.units.map((unit, index) => (
                    <li key={unit.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span>{unit.title}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No units available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
