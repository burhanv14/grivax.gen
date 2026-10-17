"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Course } from "@/types"

export interface CourseSidebarProps {
  course: Course
  className?: string
  expandedUnits?: number[] // kept for compatibility; the sidebar now manages its own accordion state
  toggleUnit: (unitIndex: number) => void
  activeUnitIndex: number
  activeChapterIndex: number
  setActiveChapter: (unitIndex: number, chapterIndex: number) => void
  totalChapters?: number // unused, kept for compatibility
  progressPercentage: number
  setActiveUnitTest: (unitId: string | null) => void
  activeUnitTestId: string | null
}

const rowClass = (active: boolean) =>
  cn(
    "h-auto w-full justify-start gap-2 py-2 pl-11 pr-3 text-left",
    active
      ? "bg-primary/10 font-medium text-primary"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  )

const dotClass = (active: boolean) =>
  cn("h-2 w-2 shrink-0 rounded-full", active ? "bg-primary" : "bg-muted-foreground/40")

export default function CourseSidebar({
  course,
  className,
  toggleUnit,
  activeUnitIndex,
  activeChapterIndex,
  setActiveChapter,
  progressPercentage,
  setActiveUnitTest,
  activeUnitTestId,
}: CourseSidebarProps) {
  // Accordion: only one unit open at a time
  const [openUnit, setOpenUnit] = useState<number | null>(activeUnitIndex)
  const [progress, setProgress] = useState(progressPercentage)

  // Prop is the source of truth...
  useEffect(() => {
    setProgress(progressPercentage)
  }, [progressPercentage])

  // ...but allow live updates through the custom event
  useEffect(() => {
    const onUpdate = (event: Event) => {
      const value = (event as CustomEvent<{ progressPercentage?: number }>).detail?.progressPercentage
      if (typeof value === "number") setProgress(value) // 0 is a valid value
    }
    window.addEventListener("courseUpdated", onUpdate)
    return () => window.removeEventListener("courseUpdated", onUpdate)
  }, [])

  // When the active unit changes (next chapter, etc.), open it
  useEffect(() => {
    setOpenUnit(activeUnitIndex)
  }, [activeUnitIndex])

  const handleToggleUnit = (unitIndex: number) => {
    setOpenUnit((prev) => (prev === unitIndex ? null : unitIndex))
    toggleUnit(unitIndex) // notify parent
  }

  const handleChapterSelect = (unitIndex: number, chapterIndex: number) => {
    setActiveUnitTest(null) // leave any open unit test
    setActiveChapter(unitIndex, chapterIndex)
  }

  return (
    <TooltipProvider>
      <div className={cn("flex h-full w-full min-w-0 flex-col", className)}>
        <div className="border-b p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Course Progress</h2>
            <motion.span
              key={progress}
              className="text-xs font-medium"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {progress}%
            </motion.span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-4">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Compass className="h-4 w-4" />
              Course Curriculum
            </h2>

            <div className="space-y-2">
              {course.units.map((unit, unitIndex) => {
                const isOpen = openUnit === unitIndex
                const isActiveUnit = activeUnitIndex === unitIndex
                const allCompleted = unit.chapters.every((c) => c.isCompleted)
                const testActive = activeUnitTestId === unit.unit_id

                return (
                  <Collapsible
                    key={unit.unit_id}
                    open={isOpen}
                    onOpenChange={() => handleToggleUnit(unitIndex)}
                    className={cn(
                      "overflow-hidden rounded-md border transition-colors",
                      isActiveUnit ? "border-primary/30" : "hover:border-primary/20"
                    )}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between gap-2 rounded-none p-3",
                          isActiveUnit && "bg-muted"
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2 text-left">
                          <div
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                              isActiveUnit || isOpen
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted-foreground/20"
                            )}
                          >
                            {unitIndex + 1}
                          </div>
                          <span className="truncate font-medium">{unit.name}</span>
                        </div>
                        <ChevronDown
                          className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                        />
                      </Button>
                    </CollapsibleTrigger>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <CollapsibleContent forceMount asChild>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden bg-muted/40 dark:bg-muted/20"
                          >
                            <ul className="py-2">
                              {unit.chapters.map((chapter, chapterIndex) => {
                                // No chapter is highlighted while a unit test is open
                                const isActive =
                                  !activeUnitTestId &&
                                  isActiveUnit &&
                                  activeChapterIndex === chapterIndex

                                return (
                                  <li key={chapter.chapter_id}>
                                    <Button
                                      variant="ghost"
                                      className={rowClass(isActive)}
                                      onClick={() => handleChapterSelect(unitIndex, chapterIndex)}
                                    >
                                      <span className={dotClass(isActive)} />
                                      <span className="min-w-0 flex-1 truncate text-sm">{chapter.name}</span>
                                      {chapter.isCompleted && (
                                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                                      )}
                                    </Button>
                                  </li>
                                )
                              })}

                              <li className="mt-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    {/* span wrapper: disabled buttons don't trigger tooltips */}
                                    <span className="block">
                                      <Button
                                        variant="ghost"
                                        className={rowClass(testActive)}
                                        disabled={!allCompleted}
                                        onClick={() => setActiveUnitTest(unit.unit_id)}
                                      >
                                        <span className={dotClass(testActive)} />
                                        <span className="min-w-0 flex-1 truncate text-sm">Unit Test</span>
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{allCompleted ? "Take Unit Test" : "Complete all chapters to unlock"}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </li>
                            </ul>
                          </motion.div>
                        </CollapsibleContent>
                      )}
                    </AnimatePresence>
                  </Collapsible>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}