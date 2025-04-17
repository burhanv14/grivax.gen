import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import CoursesClientPage from "./CoursesClientPage"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"

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
      // First try to get the user directly from the database
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (dbUser) {
        console.log(`Found user in database: ${dbUser.email} with ID: ${dbUser.user_id}`)
        userId = dbUser.user_id
      } else {
        // If not found in database, try the API endpoint
        console.log(`User not found in database, trying API endpoint for email: ${session.user.email}`)
        
        // Get the host from headers to construct an absolute URL
        const headersList = headers()
        const host = headersList.get("host") || "localhost:3000"
        const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
        
        // Construct a proper absolute URL
        const apiUrl = `${protocol}://${host}/api/user?email=${encodeURIComponent(session.user.email)}`
        
        const response = await fetch(apiUrl, {
          cache: 'no-store'
        })
        
        if (response.ok) {
          const apiUser = await response.json()
          if (apiUser && apiUser.user_id) {
            console.log(`Found user from API: ${apiUser.user_id}`)
            userId = apiUser.user_id
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Continue with the user_id from params if there's an error
    }
  }
  
  console.log(`Using user ID for courses page: ${userId}`)
  
  // Pass the user ID to the client component
  return <CoursesClientPage params={{ user_id: userId }} />
}
