import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function DashboardRedirect() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Find user in database by email
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser) {
    redirect("/auth/signin")
  }

  // Redirect to user's dashboard
  redirect(`/dashboard/${dbUser.user_id}`)
}

