import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

// Mock data - would be fetched from an API in a real application
const enrolledCourses = [
  {
    id: "1",
    title: "Machine Learning Fundamentals",
    image: "/placeholder.svg?height=100&width=150",
    progress: 75,
    lastActivity: "2 hours ago",
    nextLesson: "Types of Neural Networks",
  },
  {
    id: "2",
    title: "Web Development Bootcamp",
    image: "/placeholder.svg?height=100&width=150",
    progress: 92,
    lastActivity: "Yesterday",
    nextLesson: "Deploying Your Application",
  },
  {
    id: "3",
    title: "Data Science with Python",
    image: "/placeholder.svg?height=100&width=150",
    progress: 45,
    lastActivity: "3 days ago",
    nextLesson: "Data Visualization Techniques",
  },
  {
    id: "4",
    title: "UI/UX Design Principles",
    image: "/placeholder.svg?height=100&width=150",
    progress: 60,
    lastActivity: "1 week ago",
    nextLesson: "User Research Methods",
  },
]

export default function EnrolledCourses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Enrolled Courses</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href="/courses">Browse More Courses</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
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
                      <Progress value={course.progress} className="h-2 flex-1" />
                      <span className="text-xs font-medium">{course.progress}%</span>
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground">Last activity: {course.lastActivity}</p>
                    <p className="text-xs">
                      Next: <span className="font-medium">{course.nextLesson}</span>
                    </p>
                  </div>
                  <div className="mt-3">
                    <Button size="sm" asChild>
                      <Link href={`/courses/${course.id}`}>Continue</Link>
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

