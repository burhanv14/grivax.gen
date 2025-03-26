import { ArrowLeft, BookOpen, Clock, Star, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CourseModules from "@/components/course-modules"
import CourseReviews from "@/components/course-reviews"

export default function CoursePage({ params }: { params: { courseId: string } }) {
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
    </div>
  )
}

