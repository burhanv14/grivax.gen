"use client"

import type React from "react"

import { Plus, RefreshCw, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Loader from "@/components/loader"
import { Input } from "@/components/ui/input"

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
    course_id: rawCourseData.course_id || "",
    user_id: rawCourseData.user_id || "",
    genId: rawCourseData.genId || "",
    title: rawCourseData.title || "Untitled Course",
    image: rawCourseData.image || "/placeholder.svg?height=200&width=300",
    createdAt: rawCourseData.createdAt ? new Date(rawCourseData.createdAt) : new Date(),
    updatedAt: rawCourseData.updatedAt ? new Date(rawCourseData.updatedAt) : new Date(),
  }
}

export default function CoursesClientPage({ params }: { params: { user_id: string } }) {
  const [userId, setUserId] = useState(params.user_id)
  const [userCourses, setUserCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState("") // State for search query

  const filteredCourses = userCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to fetch courses with retry mechanism
  const fetchCourses = async (user_id: string, retryCount = 0): Promise<Course[]> => {
    const MAX_RETRIES = 2

    try {
      console.log(`Attempting to fetch courses for user ID: ${user_id}`)
      
      // Try the primary API endpoint first
      let coursesResponse = await fetch(`/api/courses/${user_id}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })
      console.log(`Primary API response status: ${coursesResponse.status}`)

      // If the primary endpoint fails, try the alternative endpoint
      if (!coursesResponse.ok) {
        console.log("Primary API endpoint failed, trying alternative endpoint...")
        coursesResponse = await fetch(`/api/courses?userId=${user_id}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        })
        console.log(`Alternative API response status: ${coursesResponse.status}`)

        if (!coursesResponse.ok) {
          const errorData = await coursesResponse.json()
          console.error("API Error:", errorData)
          throw new Error(`Failed to fetch courses from both endpoints: ${errorData.error || coursesResponse.statusText}`)
        }
      }

      const coursesData = await coursesResponse.json()
      console.log("Raw courses data:", coursesData)

      if (Array.isArray(coursesData)) {
        const formattedCourses = coursesData.map(formatCourseData)
        console.log("Formatted courses:", formattedCourses)
        return formattedCourses
      } else {
        console.error("Invalid courses data format:", coursesData)
        throw new Error("Invalid courses data format")
      }
    } catch (error) {
      console.error(`Error fetching courses (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error)

      // Retry if we haven't reached the maximum number of retries
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`)
        await new Promise((resolve) => setTimeout(resolve, (retryCount + 1) * 1000))
        return fetchCourses(user_id, retryCount + 1)
      }

      throw error
    }
  }

  // Function to refresh courses
  const refreshCourses = () => {
    setRefreshKey(prev => prev + 1)
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
  }, [params.user_id, refreshKey])

  // Debug: Log courses when they change
  useEffect(() => {
    console.log("Courses updated:", userCourses)
  }, [userCourses])

  if (isLoading) {
    return (
      <Loader />
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <motion.div
          className="bg-destructive/10 text-destructive p-6 rounded-lg mb-6 max-w-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <p className="font-medium text-lg mb-2">Error loading courses</p>
          <p className="text-sm">{error}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-12 md:px-6 md:py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        </div>
        <Button variant="outline" size="sm" className="sm:ml-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <motion.section
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            My Courses
          </motion.h2>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <span className="text-md text-muted-foreground">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshCourses}
              className="ml-2"
              title="Refresh courses"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {filteredCourses.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.course_id} course={course} userId={userId} index={index} />
            ))}
          </motion.div>
        ) : (
          <EmptyState userId={userId} />
        )}
      </motion.section>
    </motion.div>
  )
}

// Replace the CourseCard component with this enhanced version
const CourseCard = ({ course, userId, index }: { course: Course; userId: string; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setMousePosition({ x, y })
    }
  }

  return (
    <Link href={`/courses/${userId}/${course.course_id}`} className="block h-full">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        className="h-full perspective-1000 group"
      >
        <motion.div
          className="h-full relative preserve-3d rounded-xl overflow-hidden"
          animate={{
            rotateY: isHovered ? (mousePosition.x - 0.5) * 15 : 0,
            rotateX: isHovered ? (mousePosition.y - 0.5) * -15 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.8,
          }}
          style={{
            boxShadow: isHovered
              ? "0 20px 25px -5px rgba(var(--primary-rgb), 0.15), 0 10px 10px -5px rgba(var(--primary-rgb), 0.1)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 z-0 opacity-70 dark:opacity-40"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(var(--primary-rgb), 0.3), transparent 50%)`,
            }}
            animate={{
              opacity: isHovered ? [0.4, 0.6, 0.4] : 0.2,
            }}
            transition={{
              duration: 3,
              repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
          />

          {/* Card content with glass effect */}
          <div className="relative z-10 h-full backdrop-blur-[2px] bg-white/30 dark:bg-black/20 border border-white/20 dark:border-white/10">
            {/* Holographic effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 dark:from-primary/20 dark:to-primary/10 z-0 opacity-0 group-hover:opacity-100"
              animate={{
                backgroundPosition: isHovered ? ["0% 0%", "100% 100%"] : "0% 0%",
              }}
              transition={{
                duration: 3,
                repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                repeatType: "reverse",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            />

            {/* Animated corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 z-10 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-primary/70 dark:border-primary/90 rounded-tl-lg"
                animate={{
                  opacity: isHovered ? [0.7, 1, 0.7] : 0.7,
                  scale: isHovered ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div className="absolute bottom-0 right-0 w-12 h-12 z-10 overflow-hidden">
              <motion.div
                className="absolute bottom-0 right-0 w-full h-full border-b-2 border-r-2 border-primary/70 dark:border-primary/90 rounded-br-lg"
                animate={{
                  opacity: isHovered ? [0.7, 1, 0.7] : 0.7,
                  scale: isHovered ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
            </div>

            {/* Image container with effects */}
            <div className="relative">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <motion.div
                  className="w-full h-full"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={course.image || "/placeholder.svg?height=200&width=300"}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 6}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=200&width=300";
                      }}
                      style={{
                        filter: isHovered ? "brightness(0.85) contrast(1.1) saturate(1.2)" : "brightness(1) contrast(1)",
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Animated overlay with color shift */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(${isHovered ? 225 : 180}deg, 
                    rgba(var(--primary), ${isHovered ? 0.7 : 0.5}) 0%, 
                    transparent 70%, 
                    rgba(var(--primary), ${isHovered ? 0.3 : 0.2}) 100%)`,
                  mixBlendMode: "soft-light",
                }}
                animate={{
                  opacity: isHovered ? [0.6, 0.8, 0.6] : 0.5,
                }}
                transition={{
                  duration: 3,
                  repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                  ease: "easeInOut",
                }}
              />

              {/* Animated particles */}
              {isHovered && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-white"
                      initial={{
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{
                        y: [null, "-50%"],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 1.5 + Math.random() * 2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.2,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}

              {/* Course title with animated underline */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-4 z-20"
                animate={{
                  y: isHovered ? -5 : 0,
                }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <h3 className="font-bold text-md text-white drop-shadow-md line-clamp-2 bg-pink-200 dark:text-white dark:bg-black rounded-lg py-1 px-2">{course.title}</h3>
                <motion.div
                  className="h-0.5 bg-white/70 mt-2 w-0"
                  animate={{
                    width: isHovered ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </div>

            {/* Card footer with interactive elements */}
            <div className="p-4 space-y-3 relative">
              {/* Animated line separator */}
              <motion.div
                className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                animate={{
                  opacity: isHovered ? [0.3, 0.7, 0.3] : 0.3,
                  backgroundPosition: isHovered ? ["0% 0%", "100% 0%"] : "0% 0%",
                }}
                transition={{
                  duration: 3,
                  repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                  ease: "easeInOut",
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              />

              {/* Date and interactive elements */}
              <div className="flex items-center justify-between pt-1">
                <motion.div
                  className="flex items-center gap-1"
                  animate={{
                    x: isHovered ? 5 : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <span className="text-xs text-muted-foreground">
                    {new Date(course.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </motion.div>

                {/* Animated pulse indicators */}
                <motion.div
                  className="flex items-center gap-2"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div key={i} className="relative">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                          delay,
                        }}
                      />
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary"
                          initial={{ scale: 1, opacity: 0.7 }}
                          animate={{
                            scale: [1, 3],
                            opacity: [0.7, 0],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            delay,
                          }}
                        />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Explore button with animated arrow */}
              <motion.div
                className="overflow-hidden"
                animate={{
                  height: isHovered ? "auto" : 0,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                  <motion.span
                    className="text-sm font-medium bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 0%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                    style={{
                      backgroundSize: "200% 100%",
                    }}
                  >
                    Explore Course
                  </motion.span>
                  <motion.div
                    animate={{
                      x: [0, 5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.path
                        d="M3.33337 8H12.6667"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{
                          pathLength: [0, 1],
                          opacity: [0.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                          repeatDelay: 0.5,
                        }}
                      />
                      <motion.path
                        d="M8 3.33337L12.6667 8.00004L8 12.6667"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{
                          pathLength: [0, 1],
                          opacity: [0.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                          repeatDelay: 0.5,
                          delay: 0.2,
                        }}
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Prismatic edge effect */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[2px] z-30"
            style={{
              background: "linear-gradient(to right, #ff0080, #7928ca, #0070f3, #00dfd8, #ff0080)",
              backgroundSize: "200% 100%",
              opacity: 0,
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
              backgroundPosition: ["0% 0%", "200% 0%"],
            }}
            transition={{
              opacity: { duration: 0.3 },
              backgroundPosition: {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
            }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[2px] z-30"
            style={{
              background: "linear-gradient(to right, #ff0080, #7928ca, #0070f3, #00dfd8, #ff0080)",
              backgroundSize: "200% 100%",
              opacity: 0,
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
              backgroundPosition: ["200% 0%", "0% 0%"],
            }}
            transition={{
              opacity: { duration: 0.3 },
              backgroundPosition: {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
            }}
          />

          {/* Reflection effect */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5 rounded-b-xl transform scale-y-[-0.3] translate-y-[1px] opacity-50 blur-sm"
            animate={{
              opacity: isHovered ? 0.7 : 0.5,
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.div>
    </Link>
  )
}

const EmptyState = ({ userId }: { userId: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.7,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className="rounded-xl border border-dashed p-12 text-center bg-gradient-to-br from-background/50 to-background/80 backdrop-blur-sm"
    >
      <motion.div
        className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mb-6 relative"
        animate={{
          boxShadow: ["0 0 0 0 rgba(var(--primary), 0.2)", "0 0 0 10px rgba(var(--primary), 0)"],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeOut",
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
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
      </motion.div>
      <motion.h3
        className="text-2xl font-medium mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Your creative journey awaits
      </motion.h3>
      <motion.p
        className="text-muted-foreground mb-8 max-w-md mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Begin your learning adventure with personalized AI-generated courses tailored to your unique interests and
        goals.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button asChild size="lg" className="px-8 relative overflow-hidden group">
          <Link href={`/generate-courses/${userId}`}>
            <motion.span
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.05 }}
            />
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
    </motion.div>
  )
}
