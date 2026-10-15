import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import CoursesClientPage from "./CoursesClientPage"
import { redirect } from "next/navigation"
import { BACKEND_URL } from "@/lib/backend"

export const metadata = {
  title: "Courses | Grivax",
  description: "Browse our collection of dynamic, AI-generated courses",
}

export default async function CoursesPage({ params }: { params: { user_id: string } }) {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect("/login?callbackUrl=" + encodeURIComponent(`/courses/${params.user_id}`))
  }
  
  let userId = params.user_id
  
  if (session?.user?.email) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user?email=${encodeURIComponent(session.user.email)}`, {
        cache: 'no-store'
      })
      
      if (response.ok) {
        const apiUser = await response.json()
        if (apiUser && apiUser.user_id) {
          if (apiUser.user_id !== params.user_id) {
            redirect(`/courses/${apiUser.user_id}`)
          }
          userId = apiUser.user_id
        }
      }
    } catch (error) {
      if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
        throw error
      }
      console.error("Error fetching user data:", error)
    }
  }
  
  return <CoursesClientPage params={{ user_id: userId }} />
}
