"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

interface CourseSidebarProps {
  course: Course
  expandedUnits: number[]
  toggleUnit: (unitIndex: number) => void
  activeUnitIndex: number
  activeChapterIndex: number
  setActiveChapter: (unitIndex: number, chapterIndex: number) => void
  totalChapters: number
  progressPercentage: number
}

export function CourseSidebar({
  course,
  expandedUnits,
  toggleUnit,
  activeUnitIndex,
  activeChapterIndex,
  setActiveChapter,
  totalChapters,
  progressPercentage,
}: CourseSidebarProps) {
  // Animation states
  const [hoveredUnit, setHoveredUnit] = useState<number | null>(null)
  const [hoveredChapter, setHoveredChapter] = useState<{ unit: number; chapter: number } | null>(null)
  const [lastActiveUnit, setLastActiveUnit] = useState(activeUnitIndex)
  const [lastActiveChapter, setLastActiveChapter] = useState(activeChapterIndex)
  const [expandedUnitsState, setExpandedUnitsState] = useState(expandedUnits)

  // Track changes in active unit/chapter for animations
  useEffect(() => {
    setLastActiveUnit(activeUnitIndex)
    setLastActiveChapter(activeChapterIndex)
  }, [activeUnitIndex, activeChapterIndex])

  // Update local state when expandedUnits prop changes
  useEffect(() => {
    setExpandedUnitsState(expandedUnits)
  }, [expandedUnits])

  // Enhanced setActiveChapter that automatically collapses other units
  const handleChapterSelect = (unitIndex: number, chapterIndex: number) => {
    // If selecting a chapter in a different unit, collapse other units
    if (unitIndex !== activeUnitIndex) {
      // First close all units with animation
      setExpandedUnitsState([])

      // Then after a short delay, open the selected unit
      setTimeout(() => {
        setExpandedUnitsState([unitIndex])

        // Set the active chapter with a slight delay for visual flow
        setTimeout(() => {
          setActiveChapter(unitIndex, chapterIndex)
        }, 100)
      }, 300) // Match the animation duration
    } else {
      // Same unit, just update the chapter with a subtle animation effect
      // First slightly dim the current chapter
      const chapterElement = document.querySelector(`[data-chapter="${activeUnitIndex}-${activeChapterIndex}"]`)
      if (chapterElement) {
        chapterElement.classList.add("opacity-50")
        setTimeout(() => {
          chapterElement.classList.remove("opacity-50")
        }, 300)
      }

      // Then update the active chapter
      setActiveChapter(unitIndex, chapterIndex)
    }
  }

  // Enhanced toggleUnit that respects our animation flow
  const handleToggleUnit = (unitIndex: number) => {
    const isExpanded = expandedUnitsState.includes(unitIndex)

    if (isExpanded) {
      // Closing this unit with a smooth animation
      setExpandedUnitsState(expandedUnitsState.filter((idx) => idx !== unitIndex))
    } else {
      // For a smoother animation when opening a new unit while another is open,
      // we'll use a sequential approach
      if (expandedUnitsState.length > 0) {
        // First close all units
        setExpandedUnitsState([])

        // Then after a short delay, open the selected unit
        setTimeout(() => {
          setExpandedUnitsState([unitIndex])
        }, 300) // Match the closing animation duration
      } else {
        // No units open, just open this one immediately
        setExpandedUnitsState([unitIndex])
      }
    }

    // Call the original toggleUnit to update parent state
    toggleUnit(unitIndex)
  }

  return (
    <div className="h-full flex flex-col md:ml-0 md:mr-2">
      <motion.div
        className="p-4 border-b"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Course Progress</h2>
          <motion.span
            className="text-xs font-medium"
            key={progressPercentage}
            initial={{ scale: 1.2, color: "#10b981" }}
            animate={{ scale: 1, color: "currentColor" }}
            transition={{ duration: 0.4 }}
          >
            {progressPercentage}%
          </motion.span>
        </div>
        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.5, ease: "easeOut" }}>
          <Progress value={progressPercentage} className="h-2" />
        </motion.div>
      </motion.div>

      <ScrollArea className="flex-1">
        <motion.div
          className="p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.h2
            className="font-semibold mb-4 flex items-center gap-2"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Compass className="h-4 w-4" />
            Course Curriculum
          </motion.h2>

          <div className="space-y-2">
            {course.units.map((unit, unitIndex) => (
              <motion.div
                key={unit.unit_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: unitIndex * 0.1 }}
                layout
              >
                <Collapsible
                  open={expandedUnitsState.includes(unitIndex)}
                  className={`border rounded-md overflow-hidden transition-all duration-300 ${
                    hoveredUnit === unitIndex
                      ? "border-primary/40 shadow-sm"
                      : activeUnitIndex === unitIndex
                        ? "border-primary/30"
                        : "hover:border-primary/20"
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      boxShadow: expandedUnitsState.includes(unitIndex)
                        ? "0 4px 12px rgba(0, 0, 0, 0.08)"
                        : "0 0px 0px rgba(0, 0, 0, 0)",
                      y: expandedUnitsState.includes(unitIndex) ? 0 : 2,
                      backgroundColor: expandedUnitsState.includes(unitIndex)
                        ? "rgba(var(--background), 1)"
                        : "rgba(var(--background), 0.5)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`w-full justify-between p-3 rounded-none transition-all duration-300 ${
                          activeUnitIndex === unitIndex ? "bg-muted" : ""
                        }`}
                        onClick={() => handleToggleUnit(unitIndex)}
                        onMouseEnter={() => setHoveredUnit(unitIndex)}
                        onMouseLeave={() => setHoveredUnit(null)}
                      >
                        <div className="flex items-center gap-2 text-left">
                          <motion.div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                              activeUnitIndex === unitIndex
                                ? "bg-primary text-primary-foreground"
                                : hoveredUnit === unitIndex
                                  ? "bg-primary/60 text-primary-foreground"
                                  : "bg-muted-foreground/20"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            initial={{ scale: 0.9 }}
                            animate={{
                              scale: expandedUnitsState.includes(unitIndex) ? 1.05 : 1,
                              backgroundColor: expandedUnitsState.includes(unitIndex)
                                ? "var(--primary)"
                                : activeUnitIndex === unitIndex
                                  ? "var(--primary)"
                                  : hoveredUnit === unitIndex
                                    ? "rgba(var(--primary), 0.6)"
                                    : "rgba(var(--muted-foreground), 0.2)",
                            }}
                          >
                            {unitIndex + 1}
                          </motion.div>
                          <span className="font-medium">{unit.name}</span>
                        </div>
                        <motion.div
                          animate={{
                            rotate: expandedUnitsState.includes(unitIndex) ? 180 : 0,
                            scale: expandedUnitsState.includes(unitIndex) ? 1.2 : 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </Button>
                    </CollapsibleTrigger>
                  </motion.div>
                  <CollapsibleContent className="bg-muted/40 dark:bg-muted/20">
                    <AnimatePresence initial={false}>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: {
                              type: "spring",
                              stiffness: 100,
                              damping: 15,
                              mass: 1,
                            },
                            opacity: { duration: 0.5, delay: 0.1 },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: {
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            },
                            opacity: { duration: 0.25 },
                          },
                        }}
                      >
                        <motion.ul
                          className="py-2"
                          variants={{
                            open: {
                              transition: {
                                staggerChildren: 0.07,
                                delayChildren: 0.1,
                              },
                            },
                            closed: {
                              transition: {
                                staggerChildren: 0.05,
                                staggerDirection: -1,
                              },
                            },
                          }}
                          initial="closed"
                          animate="open"
                          exit="closed"
                        >
                          {unit.chapters.map((chapter, chapterIndex) => {
                            const isActive = activeUnitIndex === unitIndex && activeChapterIndex === chapterIndex
                            const wasActive = lastActiveUnit === unitIndex && lastActiveChapter === chapterIndex
                            const isHovered =
                              hoveredChapter?.unit === unitIndex && hoveredChapter?.chapter === chapterIndex

                            return (
                              <motion.li
                                key={chapter.chapter_id}
                                variants={{
                                  open: {
                                    x: 0,
                                    opacity: 1,
                                    transition: {
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 20,
                                    },
                                  },
                                  closed: {
                                    x: -20,
                                    opacity: 0,
                                    transition: {
                                      duration: 0.2,
                                    },
                                  },
                                }}
                                layout
                              >
                                <motion.div
                                  whileHover={{ x: 5 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                  <Button
                                    variant="ghost"
                                    data-chapter={`${unitIndex}-${chapterIndex}`}
                                    className={`w-full justify-start px-10 py-2 h-auto text-left transition-all duration-300 ${
                                      isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                    }`}
                                    onClick={() => handleChapterSelect(unitIndex, chapterIndex)}
                                    onMouseEnter={() => setHoveredChapter({ unit: unitIndex, chapter: chapterIndex })}
                                    onMouseLeave={() => setHoveredChapter(null)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <motion.div
                                        className={`h-2 w-2 rounded-full ${
                                          isActive
                                            ? "bg-primary"
                                            : isHovered
                                              ? "bg-primary/60"
                                              : "bg-muted-foreground/40"
                                        }`}
                                        animate={{
                                          scale: isActive ? [1, 1.5, 1] : 1,
                                          backgroundColor: isActive
                                            ? "var(--primary)"
                                            : isHovered
                                              ? "rgba(var(--primary), 0.6)"
                                              : "rgba(var(--muted-foreground), 0.4)",
                                        }}
                                        transition={{
                                          duration: isActive && wasActive ? 0 : 0.5,
                                          ease: "easeInOut",
                                        }}
                                      />
                                      <span className="text-sm truncate">{chapter.name}</span>
                                    </div>
                                  </Button>
                                </motion.div>
                              </motion.li>
                            )
                          })}
                        </motion.ul>
                      </motion.div>
                    </AnimatePresence>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </ScrollArea>
    </div>
  )
}
