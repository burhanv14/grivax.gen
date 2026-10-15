import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function CourseRedirect() {
  try {
    // Check for authenticated session
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      redirect("/login?callbackUrl=" + encodeURIComponent("/courses/[user_id]"))
    }

    // Find user in database by email
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        user_id: true,
        email: true,
      }
    })

    if (!dbUser) {
      // Log this as a warning since it's an unexpected state
      console.warn("User found in session but not in database:", session.user.email)
      redirect("/login?error=UserNotFound")
    }

    // Redirect to user's dashboard
    redirect(`/dashboard/${dbUser.user_id}`)
  } catch (error) {
    // Only log actual errors, not redirect "errors"
    if (!(error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
      console.error("Unexpected error in courses redirect:", error)
      redirect("/login?error=ServerError")
    }
    throw error // Re-throw the error to let Next.js handle redirects
  }
}

