"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Define the Course type
interface Course {
  course_id: string
  user_id: string
  genId: string
  title: string
  image: string
  createdAt: Date
  updatedAt: Date
}

// Utility function to format course data consistently
const formatCourseData = (rawCourseData: any): Course => {
  return {
    course_id: rawCourseData.course_id || '',
    user_id: rawCourseData.user_id || '',
    genId: rawCourseData.genId || '',
    title: rawCourseData.title || 'Untitled Course',
    image: rawCourseData.image || '/placeholder.svg?height=200&width=300',
    createdAt: rawCourseData.createdAt ? new Date(rawCourseData.createdAt) : new Date(),
    updatedAt: rawCourseData.updatedAt ? new Date(rawCourseData.updatedAt) : new Date()
  }
}

export default function CoursesClientPage({ params }: { params: { user_id: string } }) {
  const [userId, setUserId] = useState(params.user_id)
  const [userCourses, setUserCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch courses with retry mechanism
  const fetchCourses = async (user_id: string, retryCount = 0): Promise<Course[]> => {
    const MAX_RETRIES = 2;
    
    try {
      // Try the primary API endpoint first
      let coursesResponse = await fetch(`/api/courses/${user_id}`)
      
      // If the primary endpoint fails, try the alternative endpoint
      if (!coursesResponse.ok) {
        console.log("Primary API endpoint failed, trying alternative endpoint...")
        coursesResponse = await fetch(`/api/courses?userId=${user_id}`)
        
        if (!coursesResponse.ok) {
          throw new Error(`Failed to fetch courses from both endpoints: ${coursesResponse.statusText}`)
        }
      }
      
      const coursesData = await coursesResponse.json()
      
      if (Array.isArray(coursesData)) {
        return coursesData.map(formatCourseData)
      } else {
        throw new Error("Invalid courses data format")
      }
    } catch (error) {
      console.error(`Error fetching courses (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error)
      
      // Retry if we haven't reached the maximum number of retries
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`)
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000))
        return fetchCourses(user_id, retryCount + 1)
      }
      
      throw error
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Use the user_id from params directly
        const user_id = params.user_id
        setUserId(user_id)

        // Fetch courses with retry mechanism
        const formattedCourses = await fetchCourses(user_id)
        
        // Debug: Log the formatted courses
        console.log("Formatted courses:", formattedCourses)
        
        setUserCourses(formattedCourses)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
        setUserCourses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.user_id])

  // Debug: Log courses when they change
  useEffect(() => {
    console.log("Courses updated:", userCourses)
  }, [userCourses])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading your courses...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
          <p className="font-medium">Error loading courses</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Your Learning Masterpieces
          </h1>
          <p className="max-w-[700px] text-muted-foreground">
            Discover your collection of exquisitely crafted AI-generated courses designed to transform your learning
            experience.
          </p>
        </div>
        <Button asChild className="sm:self-start group relative overflow-hidden" size="lg">
          <Link href={`/generate-courses/${userId}`}>
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
            <span>Create New Course</span>
          </Link>
        </Button>
      </div>

      {/* Courses Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">My Courses</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{userCourses.length} courses</span>
          </div>
        </div>

        {userCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {userCourses.map((course, index) => (
              <CourseCard key={course.course_id} course={course} userId={userId} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState userId={userId} />
        )}
      </section>
    </div>
  )
}

// Client components for animations
const CourseCard = ({ course, userId, index }: { course: Course; userId: string; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/courses/${userId}/${course.course_id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full perspective-1000"
      >
        <motion.div
          className="h-full relative preserve-3d"
          animate={{
            rotateY: isHovered ? 15 : 0,
            rotateX: isHovered ? -5 : 0,
            z: isHovered ? 50 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="h-full rounded-xl overflow-hidden border border-primary/10 shadow-xl backdrop-blur-sm bg-gradient-to-br from-background/80 via-background to-background/90 dark:from-background/40 dark:via-background/60 dark:to-background/40">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 z-0"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -ml-5 -mb-5 z-0"></div>

            {/* Glass card content */}
            <div className="relative z-10 p-1">
              <div className="relative">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
                  <motion.div
                    className="w-full h-full"
                    animate={{
                      scale: isHovered ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.img
                      src={course.image || "/placeholder.svg?height=200&width=300"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      style={{
                        filter: isHovered ? "brightness(0.85) contrast(1.1)" : "brightness(1) contrast(1)",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Course title on image */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-4"
                    animate={{
                      y: isHovered ? -5 : 0,
                      opacity: isHovered ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-bold text-lg text-white drop-shadow-md line-clamp-2">{course.title}</h3>
                  </motion.div>
                </div>

                {/* Floating badge */}
                <motion.div
                  className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full shadow-lg"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? 5 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  NEW
                </motion.div>
              </div>

              <div className="p-4 space-y-3">
                {/* Interactive elements */}
                <div className="flex items-center justify-between">
                  <motion.div
                    className="flex items-center gap-1"
                    animate={{
                      x: isHovered ? 5 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xs text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-1"
                    animate={{
                      scale: isHovered ? 1.2 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Animated dots */}
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        delay: 0,
                      }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-primary/80"
                      animate={{
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-primary/60"
                      animate={{
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        delay: 0.4,
                      }}
                    />
                  </motion.div>
                </div>

                {/* Explore button */}
                <motion.div
                  className="mt-2 overflow-hidden"
                  animate={{
                    height: isHovered ? "auto" : 0,
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                    <span className="text-sm font-medium text-primary">Explore Course</span>
                    <motion.div
                      animate={{
                        x: isHovered ? 5 : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                        repeatType: "reverse",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M3.33337 8H12.6667"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 3.33337L12.6667 8.00004L8 12.6667"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Reflection effect */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5 rounded-b-xl transform scale-y-[-0.3] translate-y-[1px] opacity-50 blur-sm"></div>
        </motion.div>
      </motion.div>
    </Link>
  )
}

const EmptyState = ({ userId }: { userId: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-dashed p-12 text-center bg-gradient-to-br from-background/50 to-background/80 backdrop-blur-sm"
    >
      <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse"></div>
        <motion.div
          animate={{
            rotate: [0, 180],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            },
          }}
          className="relative z-10 bg-gradient-to-br from-primary/80 to-primary rounded-full p-4"
        >
          <Plus className="h-10 w-10 text-primary-foreground" />
        </motion.div>
      </div>
      <h3 className="text-2xl font-medium mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Your creative journey awaits
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Begin your learning adventure with personalized AI-generated courses tailored to your unique interests and
        goals.
      </p>
      <Button asChild size="lg" className="px-8 relative overflow-hidden group">
        <Link href={`/generate-courses/${userId}`}>
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <motion.div
            animate={{
              rotate: [0, 90],
            }}
            transition={{
              duration: 0.3,
              repeat: 0,
              repeatType: "reverse",
            }}
            className="mr-2"
          >
            <Plus className="h-5 w-5" />
          </motion.div>
          <span>Create Your First Masterpiece</span>
        </Link>
      </Button>
    </motion.div>
  )
}
