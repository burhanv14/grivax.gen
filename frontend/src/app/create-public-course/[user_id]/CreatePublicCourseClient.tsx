"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Unit {
  id: string
  name: string
  chapters: Chapter[]
}

interface Chapter {
  id: string
  name: string
  youtubeVidLink: string
  readingMaterial: string
}

export default function CreatePublicCourseClient({ 
  params 
}: { 
  params: { user_id: string } 
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Course form data
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    image: "/images/learning-illustration.svg"
  })
  
  // Units and chapters
  const [units, setUnits] = useState<Unit[]>([
    {
      id: "1",
      name: "Introduction",
      chapters: [
        {
          id: "1-1",
          name: "Welcome to the Course",
          youtubeVidLink: "",
          readingMaterial: ""
        }
      ]
    }
  ])

  // Add new unit
  const addUnit = () => {
    const newUnit: Unit = {
      id: Date.now().toString(),
      name: `Unit ${units.length + 1}`,
      chapters: [
        {
          id: `${Date.now()}-1`,
          name: "Chapter 1",
          youtubeVidLink: "",
          readingMaterial: ""
        }
      ]
    }
    setUnits([...units, newUnit])
  }

  // Remove unit
  const removeUnit = (unitId: string) => {
    if (units.length > 1) {
      setUnits(units.filter(unit => unit.id !== unitId))
    }
  }

  // Update unit name
  const updateUnitName = (unitId: string, name: string) => {
    setUnits(units.map(unit => 
      unit.id === unitId ? { ...unit, name } : unit
    ))
  }

  // Add chapter to unit
  const addChapter = (unitId: string) => {
    setUnits(units.map(unit => {
      if (unit.id === unitId) {
        const newChapter: Chapter = {
          id: `${unitId}-${Date.now()}`,
          name: `Chapter ${unit.chapters.length + 1}`,
          youtubeVidLink: "",
          readingMaterial: ""
        }
        return { ...unit, chapters: [...unit.chapters, newChapter] }
      }
      return unit
    }))
  }

  // Remove chapter
  const removeChapter = (unitId: string, chapterId: string) => {
    setUnits(units.map(unit => {
      if (unit.id === unitId) {
        const updatedChapters = unit.chapters.filter(chapter => chapter.id !== chapterId)
        if (updatedChapters.length > 0) {
          return { ...unit, chapters: updatedChapters }
        }
      }
      return unit
    }))
  }

  // Update chapter data
  const updateChapter = (unitId: string, chapterId: string, field: keyof Chapter, value: string) => {
    setUnits(units.map(unit => {
      if (unit.id === unitId) {
        return {
          ...unit,
          chapters: unit.chapters.map(chapter => 
            chapter.id === chapterId ? { ...chapter, [field]: value } : chapter
          )
        }
      }
      return unit
    }))
  }

  // Save as draft
  const saveAsDraft = async () => {
    if (!courseData.title.trim()) {
      toast.error("Please enter a course title")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/public-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseData.title,
          description: courseData.description,
          image: courseData.image,
          units: units.map(unit => ({
            name: unit.name,
            chapters: unit.chapters.map(chapter => ({
              name: chapter.name,
              youtubeVidLink: chapter.youtubeVidLink,
              readingMaterial: chapter.readingMaterial
            }))
          }))
        })
      })

      if (response.ok) {
        const newCourse = await response.json()
        toast.success("Course saved as draft successfully!")
        router.push(`/public-courses/${newCourse.public_course_id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to save course")
      }
    } catch (error) {
      console.error("Error saving course:", error)
      toast.error("Failed to save course")
    } finally {
      setIsSaving(false)
    }
  }

  // Publish course
  const publishCourse = async () => {
    if (!courseData.title.trim()) {
      toast.error("Please enter a course title")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/public-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseData.title,
          description: courseData.description,
          image: courseData.image,
          isPublished: true,
          units: units.map(unit => ({
            name: unit.name,
            chapters: unit.chapters.map(chapter => ({
              name: chapter.name,
              youtubeVidLink: chapter.youtubeVidLink,
              readingMaterial: chapter.readingMaterial
            }))
          }))
        })
      })

      if (response.ok) {
        const newCourse = await response.json()
        toast.success("Course published successfully!")
        router.push(`/public-courses/${newCourse.public_course_id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to publish course")
      }
    } catch (error) {
      console.error("Error publishing course:", error)
      toast.error("Failed to publish course")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/courses/${params.user_id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Public Course</h1>
            <p className="text-muted-foreground">Create a course that students can enroll in</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Course Information */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                placeholder="Enter course title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                placeholder="Enter course description"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="image">Course Image URL</Label>
              <Input
                id="image"
                value={courseData.image}
                onChange={(e) => setCourseData({ ...courseData, image: e.target.value })}
                placeholder="Enter image URL"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Course Content</CardTitle>
              <Button onClick={addUnit} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {units.map((unit, unitIndex) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: unitIndex * 0.1 }}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor={`unit-${unit.id}`}>Unit {unitIndex + 1}</Label>
                    <Input
                      id={`unit-${unit.id}`}
                      value={unit.name}
                      onChange={(e) => updateUnitName(unit.id, e.target.value)}
                      placeholder="Enter unit name"
                      className="mt-1"
                    />
                  </div>
                  {units.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeUnit(unit.id)}
                      className="ml-4 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Chapters</h4>
                    <Button onClick={() => addChapter(unit.id)} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Chapter
                    </Button>
                  </div>

                  {unit.chapters.map((chapter, chapterIndex) => (
                    <motion.div
                      key={chapter.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: chapterIndex * 0.05 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Chapter {chapterIndex + 1}</h5>
                        {unit.chapters.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeChapter(unit.id, chapter.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`chapter-name-${chapter.id}`}>Chapter Name</Label>
                        <Input
                          id={`chapter-name-${chapter.id}`}
                          value={chapter.name}
                          onChange={(e) => updateChapter(unit.id, chapter.id, 'name', e.target.value)}
                          placeholder="Enter chapter name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`youtube-${chapter.id}`}>YouTube Video Link</Label>
                        <Input
                          id={`youtube-${chapter.id}`}
                          value={chapter.youtubeVidLink}
                          onChange={(e) => updateChapter(unit.id, chapter.id, 'youtubeVidLink', e.target.value)}
                          placeholder="Enter YouTube video URL"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`reading-${chapter.id}`}>Reading Material</Label>
                        <Textarea
                          id={`reading-${chapter.id}`}
                          value={chapter.readingMaterial}
                          onChange={(e) => updateChapter(unit.id, chapter.id, 'readingMaterial', e.target.value)}
                          placeholder="Enter reading material content"
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="outline"
            onClick={saveAsDraft}
            disabled={isSaving || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save as Draft"}
          </Button>
          
          <Button
            onClick={publishCourse}
            disabled={isSaving || isLoading}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isLoading ? "Publishing..." : "Publish Course"}
          </Button>
        </div>
      </div>
    </div>
  )
}
