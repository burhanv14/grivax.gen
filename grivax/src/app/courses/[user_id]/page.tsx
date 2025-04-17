import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import CoursesClientPage from "./CoursesClientPage"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Courses | Grivax.gen",
  description: "Browse our collection of dynamic, AI-generated courses",
}

export default async function CoursesPage({ params }: { params: { user_id: string } }) {
  // Get the session on the server side
  const session = await getServerSession(authConfig)
  
  // If no session, redirect to login
  if (!session) {
    redirect("/login")
  }
  
  // Get the user ID from the session or params
  let userId = params.user_id
  
  // If we have a session with email, try to get the user ID from the database
  if (session?.user?.email) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user?email=${session.user.email}`, {
        cache: 'no-store'
      })
      
      if (response.ok) {
        const dbUser = await response.json()
        if (dbUser && dbUser.user_id) {
          userId = dbUser.user_id
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Continue with the user_id from params if there's an error
    }
  }
  
  // Pass the user ID to the client component
  return <CoursesClientPage params={{ user_id: userId }} />
}
