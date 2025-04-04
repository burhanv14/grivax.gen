import { ArrowLeft, BookOpen, Clock, Star, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Filter, Plus } from "lucide-react"
import CourseGrid from "@/components/course-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import CourseModules from "@/components/course-modules"
import CourseReviews from "@/components/course-reviews"

export default function CoursePage({ params }: { params: { courseId: string } }) {
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
  // This would be fetched from an API in a real application
  const course = {
    id: params.courseId,
    title: "Advanced Machine Learning Algorithms",
    description:
      "Master the most advanced machine learning algorithms and techniques used in industry today. This comprehensive course covers deep learning, reinforcement learning, and more.",
    instructor: "Dr. Sarah Johnson",
    rating: 4.8,
    students: 2543,
    duration: "12 weeks",
    level: "Advanced",
    progress: 35,
    image: "/placeholder.svg?height=400&width=600",
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <Link
        href="/courses"
        className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 overflow-hidden rounded-xl">
            <Image
              src={course.image || "/placeholder.svg"}
              alt={course.title}
              width={800}
              height={450}
              className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="mb-8">
            <h1 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-medium">{course.rating}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-1 h-4 w-4" />
                <span>{course.students.toLocaleString()} students</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <BookOpen className="mr-1 h-4 w-4" />
                <span>{course.level}</span>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">{course.description}</p>
          </div>

          <Tabs defaultValue="modules" className="mb-8">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            <TabsContent value="modules">
              <CourseModules courseId={course.id} />
            </TabsContent>
            <TabsContent value="reviews">
              <CourseReviews courseId={course.id} />
            </TabsContent>
            <TabsContent value="resources">
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-semibold">Course Resources</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
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
                      className="h-5 w-5 text-primary"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <a href="#" className="text-primary hover:underline">
                      Course Syllabus.pdf
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
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
                      className="h-5 w-5 text-primary"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <a href="#" className="text-primary hover:underline">
                      Lecture Notes.pdf
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
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
                      className="h-5 w-5 text-primary"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <a href="#" className="text-primary hover:underline">
                      Code Examples.zip
                    </a>
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-xl border bg-background p-6 shadow-sm dark:bg-muted/50">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Your Progress</h3>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={course.progress} className="h-2" />
                <span className="text-sm font-medium">{course.progress}%</span>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Instructor</span>
                <span className="font-medium">{course.instructor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level</span>
                <span className="font-medium">{course.level}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full">Continue Learning</Button>
              <Button variant="outline" className="w-full">
                Download Materials
              </Button>
            </div>
          </div>
        </div>
      </div>
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

