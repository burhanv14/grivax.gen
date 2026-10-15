import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BACKEND_URL } from "@/lib/backend"

export const dynamic = "force-dynamic"

export default async function CourseRedirect() {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      redirect("/login?callbackUrl=" + encodeURIComponent("/courses"))
    }

    if (session.user.id) {
      redirect(`/courses/${session.user.id}`)
    }

    const res = await fetch(`${BACKEND_URL}/api/user?email=${encodeURIComponent(session.user.email)}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      console.warn("User found in session but not in backend:", session.user.email)
      redirect("/login?error=UserNotFound")
    }

    const dbUser = await res.json()
    redirect(`/courses/${dbUser.user_id}`)
  } catch (error) {
    if (!(error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
      console.error("Unexpected error in courses redirect:", error)
      redirect("/login?error=ServerError")
    }
    throw error
  }
}
