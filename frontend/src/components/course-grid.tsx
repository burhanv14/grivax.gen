import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data - would be fetched from an API in a real application
const allCourses: Course[] = [
  {
    id: "1",
    title: "Machine Learning Fundamentals",
    description: "Learn the core concepts and algorithms of machine learning",
    image: "/placeholder.svg?height=200&width=300",
    level: "Beginner",
    duration: "8 weeks",
    rating: 4.8,
    students: 1245,
    tag: "Popular",
    category: ["popular", "beginner"],
  },
  {
    id: "2",
    title: "Advanced Web Development",
    description: "Master modern web development with React, Next.js, and more",
    image: "/placeholder.svg?height=200&width=300",
    level: "Intermediate",
    duration: "10 weeks",
    rating: 4.9,
    students: 987,
    tag: "New",
    category: ["new", "intermediate"],
  },
  {
    id: "3",
    title: "Data Science with Python",
    description: "Analyze and visualize data using Python and popular libraries",
    image: "/placeholder.svg?height=200&width=300",
    level: "Intermediate",
    duration: "12 weeks",
    rating: 4.7,
    students: 1532,
    tag: "Trending",
    category: ["popular", "intermediate"],
  },
  {
    id: "4",
    title: "UI/UX Design Principles",
    description: "Learn the fundamentals of user interface and experience design",
    image: "/placeholder.svg?height=200&width=300",
    level: "Beginner",
    duration: "6 weeks",
    rating: 4.6,
    students: 876,
    category: ["beginner"],
  },
  {
    id: "5",
    title: "Artificial Intelligence Ethics",
    description: "Explore the ethical implications and considerations in AI development",
    image: "/placeholder.svg?height=200&width=300",
    level: "Advanced",
    duration: "8 weeks",
    rating: 4.5,
    students: 632,
    category: ["new", "advanced"],
  },
  {
    id: "6",
    title: "Blockchain Development",
    description: "Build decentralized applications using blockchain technology",
    image: "/placeholder.svg?height=200&width=300",
    level: "Advanced",
    duration: "10 weeks",
    rating: 4.7,
    students: 754,
    tag: "Hot",
    category: ["popular", "advanced"],
  },
]

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  level: string;
  price?: number;
  rating: number;
  instructor?: string;
  category: string[];
  tag?: string;
  students?: number;
}

interface CourseGridProps {
  courses: Course[];
  filter?: string;
}

export function CourseGrid({ courses, filter }: CourseGridProps) {
  // Filter courses based on the selected filter
  const filteredCourses = filter ? courses.filter((course) => course.category.includes(filter)) : courses;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredCourses.map((course) => (
        <Card key={course.id} className="group overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="relative">
            <Image
              src={course.image || "/placeholder.svg"}
              alt={course.title}
              width={300}
              height={200}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {course.tag && <Badge className="absolute right-2 top-2 bg-primary">{course.tag}</Badge>}
          </div>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="outline">{course.level}</Badge>
              <span className="text-sm text-muted-foreground">{course.duration}</span>
            </div>
            <h3 className="mb-2 line-clamp-1 font-poppins text-xl font-semibold">{course.title}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t p-4">
            <div className="flex items-center gap-1">
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
                className="h-4 w-4 fill-amber-500 text-amber-500"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-sm font-medium">{course.rating}</span>
              <span className="text-xs text-muted-foreground">({course.students})</span>
            </div>
            <Link href={`/courses/${course.id}`} className="text-sm font-medium text-primary hover:underline">
              View Course
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

