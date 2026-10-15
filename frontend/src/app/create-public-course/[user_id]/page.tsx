import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
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
  // Get the session on the server side
  const session = await getServerSession(authConfig)
  
  // If no session, redirect to login
  if (!session) {
    redirect("/login")
  }
  
  // Get the user ID from the session
  let userId = params.user_id
  
  // If we have a session with email, try to get the user ID from the database
  if (session?.user?.email) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (dbUser) {
        // Verify that the requested user_id matches the current session user
        if (dbUser.user_id !== params.user_id) {
          redirect(`/create-public-course/${dbUser.user_id}`)
        }
        
        // Check if user is a teacher
        if (dbUser.role !== "TEACHER") {
          redirect("/dashboard")
        }
        
        userId = dbUser.user_id
      } else {
        redirect("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      redirect("/login")
    }
  }
  
  return <CreatePublicCourseClient params={{ user_id: userId }} />
}
