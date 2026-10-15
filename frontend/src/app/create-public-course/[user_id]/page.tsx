import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"
import CreatePublicCourseClient from "./CreatePublicCourseClient"

export const metadata = {
  title: "Create Public Course | Grivax",
  description: "Create and publish a new public course for students to enroll in",
}

export default async function CreatePublicCoursePage({ 
  params 
}: { 
  params: { user_id: string } 
}) {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect("/login")
  }
  
  if (session.user?.id && session.user.id !== params.user_id) {
    redirect(`/create-public-course/${session.user.id}`)
  }

  if (session.user?.role && session.user.role !== "TEACHER") {
    redirect("/dashboard")
  }

  return <CreatePublicCourseClient params={{ user_id: params.user_id }} />
}
