import { Filter, Plus } from "lucide-react"
import CourseGrid from "@/components/course-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { loginIsRequiredServer, authConfig } from "@/lib/auth"
import Link from "next/link"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Courses | Grivax.gen",
  description: "Browse our collection of dynamic, AI-generated courses",
}

// Mock data for recommended courses


export default async function CoursesPage() {
  await loginIsRequiredServer()

  // Get current user from session
  const session = await getServerSession(authConfig)
  let userId = ""
  
  try {
    if (session?.user?.email) {
      // Find user in database by email
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      
      if (dbUser) {
        userId = dbUser.user_id
      }
      // console.log(userId);
    }
  } catch (error) {
    console.error("Error getting current user:", error)
  }

  // Mock user courses for now - replace with your actual database query
  const userCourses = [
    // You can leave this empty to test the empty state
    // Or add mock courses like:
    /*
    {
      id: "course1",
      title: "Introduction to JavaScript",
      description: "Learn the basics of JavaScript programming language.",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "course2",
      title: "Advanced React Patterns",
      description: "Master advanced React concepts and patterns.",
      image: "/placeholder.svg?height=200&width=300",
    }
    */
  ]

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Explore Our Courses
          </h1>
          <p className="max-w-[700px] text-muted-foreground">
            Discover our comprehensive collection of dynamic courses designed to help you master any subject.
          </p>
        </div>
        <Button asChild className="sm:self-start" size="lg">
          <Link href={`/generate-courses/${userId}`}>
            <Plus className="mr-2 h-5 w-5" />
            Add New Course
          </Link>
        </Button>
      </div>

      {/* My Courses Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">My Courses</h2>
          <Link href={`/my-courses/${userId}`} className="text-primary hover:underline">
            View all
          </Link>
        </div>

        {userCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {userCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={course.image || "/placeholder.svg?height=200&width=300"}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  </div>
                </CardContent>
              </Card>
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

