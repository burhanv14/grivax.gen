"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ArrowLeft, BookOpen, ChevronRight, Clock, GraduationCap, Menu, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { YouTubePlayer } from "@/components/youtube-player"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CourseSidebar } from "@/components/course-sidebar"
import { MarkdownContent } from "@/components/MarkdownContent"

// Define interfaces for the course data structure
interface Chapter {
  chapter_id: string
  name: string
  description?: string
  youtubeVidLink: string
  readingMaterial: string | null
  unit_id: string
}

interface Unit {
  unit_id: string
  name: string
  course_id: string
  chapters: Chapter[]
}

interface Course {
  course_id: string
  title: string
  user_id: string
  units: Unit[]
}

// This would normally come from your database
// For this example, we'll use the props passed from the server component
export default function CourseClient({
  course,
  userId,
  totalChapters,
}: {
  course: Course
  userId: string
  totalChapters: number
}) {
  const [activeUnitIndex, setActiveUnitIndex] = useState(0)
  const [activeChapterIndex, setActiveChapterIndex] = useState(0)
  const [expandedUnits, setExpandedUnits] = useState([0]) // First unit expanded by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  // Mock progress data (in a real app, this would come from the database)
  const completedChapters = Math.floor(totalChapters * 0.3) // 30% completion for demo
  const progressPercentage = Math.round((completedChapters / totalChapters) * 100)

  // Get active unit and chapter
  const activeUnit = course?.units?.[activeUnitIndex]
  const activeChapter = activeUnit?.chapters?.[activeChapterIndex]

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    handleResize() // Initial check
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Toggle unit expansion with improved animation flow
  const toggleUnit = (unitIndex: number) => {
    setExpandedUnits((prev) => {
      if (prev.includes(unitIndex)) {
        return prev.filter((i) => i !== unitIndex)
      } else {
        // For better animation flow, we only allow one unit to be expanded at a time
        return [unitIndex]
      }
    })
  }

  // Set active chapter
  const setActiveChapter = (unitIndex: number, chapterIndex: number) => {
    setActiveUnitIndex(unitIndex)
    setActiveChapterIndex(chapterIndex)

    // If we're on mobile, close the sidebar
    if (isMobileView) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <motion.header
        style={{ opacity }}
        className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="container flex h-16 items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" asChild className="mr-4 group">
              <Link
                href={`/courses/${userId}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline-block">Back to Courses</span>
              </Link>
            </Button>
          </motion.div>

          <div className="flex-1 flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GraduationCap className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold tracking-tight truncate max-w-[200px] sm:max-w-md">
                {course?.title || "Loading..."}
              </h1>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.div
                className="hidden md:flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Progress value={progressPercentage} className="h-2 w-32" />
                <span className="text-xs text-muted-foreground">{progressPercentage}% complete</span>
              </motion.div>

              {isMobileView ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80">
                    {course ? (
                      <CourseSidebar
                        course={course}
                        expandedUnits={expandedUnits}
                        toggleUnit={toggleUnit}
                        activeUnitIndex={activeUnitIndex}
                        activeChapterIndex={activeChapterIndex}
                        setActiveChapter={setActiveChapter}
                        totalChapters={totalChapters}
                        progressPercentage={progressPercentage}
                      />
                    ) : (
                      <div className="p-4">Loading course content...</div>
                    )}
                  </SheetContent>
                </Sheet>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && !isMobileView && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="border-r h-[calc(100vh-64px)] overflow-hidden"
            >
              {course ? (
                <CourseSidebar
                  course={course}
                  expandedUnits={expandedUnits}
                  toggleUnit={toggleUnit}
                  activeUnitIndex={activeUnitIndex}
                  activeChapterIndex={activeChapterIndex}
                  setActiveChapter={setActiveChapter}
                  totalChapters={totalChapters}
                  progressPercentage={progressPercentage}
                />
              ) : (
                <div className="p-4">Loading course content...</div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.main
          className="flex-1 h-[calc(100vh-64px)] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeUnitIndex}-${activeChapterIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="container py-8 max-w-4xl"
            >
              {!course ? (
                <motion.div
                  className="flex items-center justify-center h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">Loading course...</h2>
                    <p className="text-muted-foreground mt-2">Please wait while we load the course content</p>
                  </div>
                </motion.div>
              ) : activeChapter ? (
                <div className="space-y-8">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-sm">
                          Unit {activeUnitIndex + 1}, Chapter {activeChapterIndex + 1}
                        </Badge>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          15 mins
                        </Badge>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          <Star className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      </motion.div>
                    </div>
                    <motion.h1
                      className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                    >
                      {activeChapter.name}
                    </motion.h1>
                    <motion.p
                      className="text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {activeChapter.description || `Part of ${activeUnit.name}`}
                    </motion.p>
                  </motion.div>

                  {/* Video Player */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Card className="overflow-hidden border shadow-md transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="aspect-video w-full">
                          <YouTubePlayer videoUrl={activeChapter.youtubeVidLink || ""} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Reading Material */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 5px 20px rgba(0, 0, 0, 0.08)",
                    }}
                    className="p-6 bg-card rounded-lg border shadow-sm transition-all duration-300"
                  >
                    <motion.h3
                      className="text-xl font-semibold mb-4 flex items-center gap-2"
                      whileHover={{ scale: 1.02, color: "var(--primary)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 10 }}
                    >
                      <BookOpen className="h-5 w-5 text-primary" />
                      Reading Material
                    </motion.h3>
                    <Separator className="my-4" />
                    <motion.div
                      className="prose dark:prose-invert max-w-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      {activeChapter.readingMaterial ? (
                        <MarkdownContent content={activeChapter.readingMaterial} />
                      ) : (
                        <p className="text-muted-foreground">No reading material available for this chapter.</p>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Navigation Buttons */}
                  <motion.div
                    className="flex justify-between items-center pt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, x: -5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        variant="outline"
                        disabled={activeChapterIndex === 0 && activeUnitIndex === 0}
                        onClick={() => {
                          if (activeChapterIndex > 0) {
                            setActiveChapter(activeUnitIndex, activeChapterIndex - 1)
                          } else if (activeUnitIndex > 0) {
                            const prevUnit = course.units[activeUnitIndex - 1]
                            setActiveChapter(activeUnitIndex - 1, prevUnit.chapters.length - 1)
                          }
                        }}
                        className="shadow-sm hover:shadow transition-all duration-300"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        variant="default"
                        disabled={
                          activeChapterIndex === activeUnit.chapters.length - 1 &&
                          activeUnitIndex === course.units.length - 1
                        }
                        onClick={() => {
                          if (activeChapterIndex < activeUnit.chapters.length - 1) {
                            setActiveChapter(activeUnitIndex, activeChapterIndex + 1)
                          } else if (activeUnitIndex < course.units.length - 1) {
                            setActiveChapter(activeUnitIndex + 1, 0)
                          }
                        }}
                        className="shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold">No content available</h2>
                  <p className="text-muted-foreground mt-2">Please select a chapter to begin learning</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  )
}

// ChevronLeft icon component
function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
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
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
