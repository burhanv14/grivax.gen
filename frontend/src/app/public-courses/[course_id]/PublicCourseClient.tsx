"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import YouTube from "react-youtube"
import ReactMarkdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Edit,
  Save,
  Eye,
  Users,
  BookOpen,
  Play,
  FileText,
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  Settings,
  Share2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import type { PublicCourse, PublicUnit, PublicChapter, PublicCourseEnrollment, Student } from "@/types"

// Extract YouTube video ID from common URL formats
const getYoutubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export default function PublicCourseClient({
  course,
  userRole,
  userId
}: {
  course: PublicCourse | null
  userRole: string
  userId: string
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Course data
  const [courseData, setCourseData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    image: course?.image || "",
    isPublished: course?.isPublished || false
  })

  // Pending chapter edits (local only, saved on "Save Changes" — no API call per keystroke)
  const [chapterEdits, setChapterEdits] = useState<Record<string, { name?: string; youtubeVidLink?: string; readingMaterial?: string }>>({})

  // Students data
  const [students, setStudents] = useState<Student[]>([])
  const [enrolledStudents, setEnrolledStudents] = useState<PublicCourseEnrollment[]>(course?.enrollments || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [isEnrolling, setIsEnrolling] = useState(false)

  const isTeacher = userRole === "TEACHER" && course?.teacher_id === userId

  // Fetch students for enrollment
  const fetchStudents = async (search: string = "") => {
    try {
      const response = await fetch(`/api/students?search=${encodeURIComponent(search)}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  // Fetch enrolled students
  const fetchEnrolledStudents = async () => {
    if (!course) return

    try {
      const response = await fetch(`/api/public-courses/${course.public_course_id}/enroll`)
      if (response.ok) {
        const data = await response.json()
        setEnrolledStudents(data)
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error)
    }
  }

  useEffect(() => {
    if (isTeacher && activeTab === "students") {
      fetchStudents(searchQuery)
      fetchEnrolledStudents()
    }
  }, [isTeacher, activeTab, searchQuery])

  // Update course + persist all pending chapter edits (only on "Save Changes")
  const updateCourse = async () => {
    if (!course) return

    setIsSaving(true)
    try {
      // 1. Save course-level fields
      const courseRes = await fetch(`/api/public-courses/${course.public_course_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      })

      if (!courseRes.ok) {
        const error = await courseRes.json()
        toast.error(error.error || "Failed to update course")
        return
      }

      // 2. Save pending chapter edits (batched, one request per changed chapter)
      const changedChapterIds = Object.keys(chapterEdits)
      if (changedChapterIds.length > 0) {
        const chapterPromises = changedChapterIds.map(chapterId => {
          const edits = chapterEdits[chapterId]
          return fetch(`/api/public-courses/${course.public_course_id}/chapters/${chapterId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(edits)
          })
        })
        const results = await Promise.all(chapterPromises)
        const failed = results.filter(r => !r.ok)
        if (failed.length > 0) {
          toast.error("Some chapter updates failed")
          return
        }
      }

      toast.success("Course updated successfully!")
      setChapterEdits({}) // clear pending edits
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error("Failed to update course")
    } finally {
      setIsSaving(false)
    }
  }

  // Publish a draft course - only clicking this changes draft -> published
  const publishCourse = async () => {
    if (!course) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/public-courses/${course.public_course_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...courseData, isPublished: true })
      })

      if (response.ok) {
        toast.success("Course published successfully!")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to publish course")
      }
    } catch (error) {
      console.error("Error publishing course:", error)
      toast.error("Failed to publish course")
    } finally {
      setIsSaving(false)
    }
  }

  // Enroll student
  const enrollStudent = async (studentId: string) => {
    if (!course) return

    setIsEnrolling(true)
    try {
      const response = await fetch(`/api/public-courses/${course.public_course_id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId })
      })

      if (response.ok) {
        toast.success("Student enrolled successfully!")
        fetchEnrolledStudents()
        setSearchQuery("")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to enroll student")
      }
    } catch (error) {
      console.error("Error enrolling student:", error)
      toast.error("Failed to enroll student")
    } finally {
      setIsEnrolling(false)
    }
  }

  // Track chapter edits locally (no API call per keystroke — saved on "Save Changes")
  const handleChapterChange = (chapterId: string, field: string, value: string) => {
    setChapterEdits(prev => ({
      ...prev,
      [chapterId]: {
        ...(prev[chapterId] || {}),
        [field]: value
      }
    }))
  }

  // Add new chapter to unit
  const addChapterToUnit = async (unitId: string) => {
    if (!course) return

    try {
      const response = await fetch(`/api/public-courses/${course.public_course_id}/units/${unitId}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "New Chapter",
          youtubeVidLink: "",
          readingMaterial: ""
        })
      })

      if (response.ok) {
        toast.success("Chapter added successfully!")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to add chapter")
      }
    } catch (error) {
      console.error("Error adding chapter:", error)
      toast.error("Failed to add chapter")
    }
  }

  if (!course) {
    return <div>Course not found</div>
  }

  const totalChapters = course.units.reduce((total, unit) => total + unit.chapters.length, 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/courses/${userId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <Badge variant={course.isPublished ? "default" : "secondary"}>
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              by {course.teacher.name || course.teacher.email}
            </p>
          </div>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={updateCourse} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                {/* Publish button shown only for draft courses */}
                {!course.isPublished && (
                  <Button onClick={publishCourse} disabled={isSaving} variant="secondary">
                    <Share2 className="h-4 w-4 mr-2" />
                    {isSaving ? "Publishing..." : "Publish"}
                  </Button>
                )}
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Course Image */}
      <div className="relative h-64 w-full rounded-lg overflow-hidden mb-8">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          {isTeacher && (
            <>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{course.units.length}</p>
                    <p className="text-sm text-muted-foreground">Units</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{totalChapters}</p>
                    <p className="text-sm text-muted-foreground">Chapters</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{course._count.enrollments}</p>
                    <p className="text-sm text-muted-foreground">Enrolled Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Description */}
          <Card>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={4}
                />
              ) : (
                <p className="text-muted-foreground">
                  {course.description || "No description provided."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {course.units.map((unit, unitIndex) => (
            <Card key={unit.public_unit_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Unit {unitIndex + 1}: {unit.name}</CardTitle>
                  {isTeacher && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addChapterToUnit(unit.public_unit_id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Chapter
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {unit.chapters.map((chapter, chapterIndex) => (
                  <div key={chapter.public_chapter_id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {isEditing ? (
                          <Input
                            value={chapterEdits[chapter.public_chapter_id]?.name ?? chapter.name}
                            onChange={(e) => handleChapterChange(chapter.public_chapter_id, 'name', e.target.value)}
                            placeholder="Chapter name"
                            className="font-medium text-lg border-none p-0 h-auto"
                          />
                        ) : (
                          <h4 className="font-medium text-lg">Chapter {chapterIndex + 1}: {chapter.name}</h4>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label>YouTube Video Link</Label>
                          <Input
                            value={chapterEdits[chapter.public_chapter_id]?.youtubeVidLink ?? chapter.youtubeVidLink}
                            onChange={(e) => handleChapterChange(chapter.public_chapter_id, 'youtubeVidLink', e.target.value)}
                            placeholder="Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=...)"
                            className="mt-1"
                          />
                          {chapter.youtubeVidLink && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Video will be embedded for students
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Reading Material (Markdown supported)</Label>
                          <Textarea
                            value={(chapterEdits[chapter.public_chapter_id]?.readingMaterial ?? chapter.readingMaterial) || ""}
                            onChange={(e) => handleChapterChange(chapter.public_chapter_id, 'readingMaterial', e.target.value)}
                            placeholder="Enter reading material content. You can use Markdown formatting."
                            className="mt-1"
                            rows={6}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Supports Markdown formatting for rich content
                          </p>
                        </div>
                      </div>
                    ) : (
                      // View mode: display actual content for both teachers and students
                      <div className="space-y-3">
                        {chapter.youtubeVidLink && getYoutubeVideoId(chapter.youtubeVidLink) && (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <YouTube
                              videoId={getYoutubeVideoId(chapter.youtubeVidLink)}
                              className="w-full h-full"
                              containerClassName="h-[520px] w-full"
                              opts={{
                                height: "100%",
                                width: "100%",
                                playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
                              }}
                            />
                          </div>
                        )}
                        {chapter.readingMaterial && (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
                            <ReactMarkdown>{chapter.readingMaterial}</ReactMarkdown>
                          </div>
                        )}
                        {!chapter.youtubeVidLink && !chapter.readingMaterial && (
                          <div className="text-sm text-muted-foreground italic text-center py-4">
                            Content will be available when published
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Students Tab (Teacher only) */}
        {isTeacher && (
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enroll Students</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {students
                    .filter(student =>
                      !enrolledStudents.some(enrollment => enrollment.student_id === student.user_id)
                    )
                    .map((student) => (
                      <div key={student.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{student.name || "No name"}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => enrollStudent(student.user_id)}
                          disabled={isEnrolling}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Enroll
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students ({enrolledStudents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enrolledStudents.map((enrollment) => (
                    <div key={enrollment.enrollment_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{enrollment.student.name || "No name"}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.student.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{enrollment.progress}% Complete</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Settings Tab (Teacher only) */}
        {isTeacher && (
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Course Image URL</Label>
                  <Input
                    id="image"
                    value={courseData.image}
                    onChange={(e) => setCourseData({ ...courseData, image: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Publish status is controlled only by the dedicated Publish button,
                    not by editing the course, so there is no toggle here. */}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
