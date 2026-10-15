import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"
import PublicCourseClient from "./PublicCourseClient"
import { BACKEND_URL } from "@/lib/backend"

export const metadata = {
  title: "Public Course | Grivax",
  description: "View and manage your public course",
}

export default async function PublicCoursePage({ 
  params 
}: { 
  params: { course_id: string } 
}) {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect("/login")
  }
  
  let publicCourse = null
  let userRole = session.user?.role || "STUDENT"
  let userId = session.user?.id || ""

  try {
    const res = await fetch(`${BACKEND_URL}/api/public-courses/${params.course_id}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      redirect("/courses")
    }

    publicCourse = await res.json()

    if (publicCourse.teacher_id !== userId && !publicCourse.isPublished) {
      redirect("/courses")
    }
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error("Error fetching public course data:", error)
    redirect("/courses")
  }
  
  return (
    <PublicCourseClient 
      course={publicCourse} 
      userRole={userRole}
      userId={userId}
    />
  )
}
