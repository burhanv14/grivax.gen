import { Filter, Plus } from "lucide-react"
import CourseGrid from "@/components/course-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { loginIsRequiredServer } from "@/lib/auth"
import Link from "next/link"

export const metadata = {
  title: "Courses | Grivax.gen",
  description: "Browse our collection of dynamic, AI-generated courses",
}

// Mock data for recommended courses
const recommendedCourses = [
  {
    id: "rec1",
    title: "Machine Learning Fundamentals",
    description: "Learn the basics of machine learning algorithms and applications.",
    image: "/placeholder.svg?height=200&width=300",
    category: "Technology",
    level: "Intermediate",
    rating: 4.8,
  },
  {
    id: "rec2",
    title: "Data Science with Python",
    description: "Master data analysis and visualization using Python libraries.",
    image: "/placeholder.svg?height=200&width=300",
    category: "Technology",
    level: "Beginner",
    rating: 4.6,
  },
  {
    id: "rec3",
    title: "Web Development Bootcamp",
    description: "Comprehensive guide to modern web development technologies.",
    image: "/placeholder.svg?height=200&width=300",
    category: "Programming",
    level: "Beginner",
    rating: 4.9,
  },
]

export default async function CoursesPage() {
  await loginIsRequiredServer()

  // Get current user - modify this based on your auth system
  const userId = "user123" // Default placeholder
  try {
    // You can replace this with your actual auth logic to get the current user
    // For example, if you're using auth.js/NextAuth:
    // const session = await getServerSession(authOptions);
    // userId = session?.user?.id;
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

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Input type="search" placeholder="Search courses..." className="pr-10" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <Button variant="outline" size="sm" className="sm:ml-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-12">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <CourseGrid />
        </TabsContent>
        <TabsContent value="popular">
          <CourseGrid filter="popular" />
        </TabsContent>
        <TabsContent value="new">
          <CourseGrid filter="new" />
        </TabsContent>
        <TabsContent value="beginner">
          <CourseGrid filter="beginner" />
        </TabsContent>
        <TabsContent value="advanced">
          <CourseGrid filter="advanced" />
        </TabsContent>
      </Tabs>

      {/* Recommended Courses Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Recommended For You</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {course.category}
                  </span>
                  <span className="inline-flex items-center text-xs text-muted-foreground">{course.level}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1 h-4 w-4 fill-primary text-primary"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

