import { loginIsRequiredServer, authConfig } from "@/lib/auth"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import CourseClient from "./CourseClient"

export async function generateMetadata({ params }: { params: { user_id: string; course_id: string } }) {
  const course = await prisma.course.findUnique({
    where: {
      user_id: params.user_id,
      course_id: params.course_id,
    },
  })

  if (!course) {
    return {
      title: "Course Not Found",
      description: "The requested course could not be found",
    }
  }

  return {
    title: `${course.title} | Grivax.gen`,
    description: `Learn ${course.title} with our AI-generated course`,
  }
}

export default async function CoursePageServer({
  params,
}: {
  params: { user_id: string; course_id: string }
}) {
  await loginIsRequiredServer()

  // Get current user from session
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.email) {
    notFound()
  }

  // Find user in database by email
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser) {
    notFound()
  }

  // Verify the user is accessing their own course
  if (dbUser.user_id !== params.user_id) {
    notFound()
  }

  // Fetch course details with units and chapters
  const course = await prisma.course.findUnique({
    where: {
      course_id: params.course_id,
      user_id: params.user_id,
    },
    include: {
      units: {
        include: {
          chapters: true,
        },
      },
    },
  })

  if (!course) {
    notFound()
  }

  // Calculate total chapters
  const totalChapters = course.units.reduce((acc, unit) => acc + unit.chapters.length, 0)

  // Pass data to client component
  return <CourseClient course={course} userId={params.user_id} totalChapters={totalChapters} />
}
