import Link from "next/link"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Badge } from "./ui/badge"
import PlaceholderImage from "./placeholder-image"

// Mock data - would be fetched from an API in a real application
const featuredCourses = [
  {
    id: "1",
    title: "Machine Learning Fundamentals",
    description: "Learn the core concepts and algorithms of machine learning",
    level: "Beginner",
    duration: "8 weeks",
    rating: 4.8,
    students: 1245,
    tag: "Popular",
  },
  {
    id: "2",
    title: "Advanced Web Development",
    description: "Master modern web development with React, Next.js, and more",
    level: "Intermediate",
    duration: "10 weeks",
    rating: 4.9,
    students: 987,
    tag: "New",
  },
  {
    id: "3",
    title: "Data Science with Python",
    description: "Analyze and visualize data using Python and popular libraries",
    level: "Intermediate",
    duration: "12 weeks",
    rating: 4.7,
    students: 1532,
    tag: "Trending",
  },
]

export default function FeaturedCourses() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featuredCourses.map((course) => (
        <Card key={course.id} className="group overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="relative">
            <PlaceholderImage
              width={300}
              height={200}
              alt={course.title}
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

