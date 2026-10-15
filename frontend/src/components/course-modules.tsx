"use client"

import { useState } from "react"
import { ChevronDown, Play, Lock } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Mock data - would be fetched from an API in a real application
const modules = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    description: "Learn the fundamentals and key concepts of machine learning",
    lessons: [
      {
        id: "1-1",
        title: "What is Machine Learning?",
        duration: "10:15",
        completed: true,
        locked: false,
      },
      {
        id: "1-2",
        title: "Types of Machine Learning",
        duration: "15:30",
        completed: true,
        locked: false,
      },
      {
        id: "1-3",
        title: "Machine Learning Workflow",
        duration: "12:45",
        completed: false,
        locked: false,
      },
    ],
    progress: 66,
  },
  {
    id: "2",
    title: "Supervised Learning Algorithms",
    description: "Explore various supervised learning algorithms and their applications",
    lessons: [
      {
        id: "2-1",
        title: "Linear Regression",
        duration: "18:20",
        completed: false,
        locked: false,
      },
      {
        id: "2-2",
        title: "Logistic Regression",
        duration: "14:10",
        completed: false,
        locked: false,
      },
      {
        id: "2-3",
        title: "Decision Trees",
        duration: "16:35",
        completed: false,
        locked: false,
      },
      {
        id: "2-4",
        title: "Support Vector Machines",
        duration: "20:15",
        completed: false,
        locked: true,
      },
    ],
    progress: 0,
  },
  {
    id: "3",
    title: "Unsupervised Learning",
    description: "Discover clustering, dimensionality reduction, and other unsupervised techniques",
    lessons: [
      {
        id: "3-1",
        title: "K-Means Clustering",
        duration: "15:45",
        completed: false,
        locked: true,
      },
      {
        id: "3-2",
        title: "Hierarchical Clustering",
        duration: "12:30",
        completed: false,
        locked: true,
      },
      {
        id: "3-3",
        title: "Principal Component Analysis",
        duration: "18:20",
        completed: false,
        locked: true,
      },
    ],
    progress: 0,
  },
]

interface CourseModulesProps {
  courseId: string
}

export default function CourseModules({ courseId }: CourseModulesProps) {
  const [expandedModule, setExpandedModule] = useState<string>("1")

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible value={expandedModule} onValueChange={setExpandedModule} className="w-full">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id} className="border rounded-lg mb-4">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-4">
                <div>
                  <h3 className="text-left font-poppins text-lg font-medium">{module.title}</h3>
                  <p className="text-left text-sm text-muted-foreground">{module.description}</p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span className="text-sm font-medium">{module.progress}%</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="mb-4">
                <Progress value={module.progress} className="h-2" />
              </div>
              <ul className="space-y-2">
                {module.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className={`flex items-center justify-between rounded-md p-2 ${
                      lesson.completed ? "bg-primary/10" : lesson.locked ? "bg-muted/50" : "hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant={lesson.completed ? "default" : "outline"}
                        className={`h-8 w-8 rounded-full ${lesson.locked ? "opacity-50" : ""}`}
                        disabled={lesson.locked}
                      >
                        {lesson.completed ? (
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
                            className="h-4 w-4"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : lesson.locked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <span
                        className={`font-medium ${
                          lesson.completed ? "text-primary" : lesson.locked ? "text-muted-foreground" : ""
                        }`}
                      >
                        {lesson.title}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

