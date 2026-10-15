import { loginIsRequiredServer, authConfig } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import CourseClient from "./CourseClient"
import { BACKEND_URL } from "@/lib/backend"

export async function generateMetadata({ params }: { params: { user_id: string; course_id: string } }) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/courses/${params.user_id}/${params.course_id}`, {
      cache: "no-store",
    })
    if (!res.ok) {
      return {
        title: "Course Not Found",
        description: "The requested course could not be found",
      }
    }
    const course = await res.json()
    return {
      title: `${course.title} | Grivax`,
      description: `Learn ${course.title} with our AI-generated course`,
    }
  } catch {
    return {
      title: "Course | Grivax",
      description: "Learn with our AI-generated course",
    }
  }
}

export default async function CoursePageServer({
  params,
}: {
  params: { user_id: string; course_id: string }
}) {
  await loginIsRequiredServer()

  const session = await getServerSession(authConfig)
  if (!session?.user?.email) {
    notFound()
  }

  // Fetch course details with units and chapters from Java backend
  const res = await fetch(`${BACKEND_URL}/api/courses/${params.user_id}/${params.course_id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    notFound()
  }

  const course = await res.json()

  // Calculate total chapters
  const units = course.units || []
  const totalChapters = units.reduce((acc: number, unit: any) => acc + (unit.chapters ? unit.chapters.length : 0), 0)

  return <CourseClient course={course} userId={params.user_id} totalChapters={totalChapters} />
}
