import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import PublicCourseClient from "./PublicCourseClient"

export const metadata = {
  title: "Public Course | Grivax",
  description: "View and manage your public course",
}

export default async function PublicCoursePage({ 
  params 
}: { 
  params: { course_id: string } 
}) {
  // Get the session on the server side
  const session = await getServerSession(authConfig)
  
  // If no session, redirect to login
  if (!session) {
    redirect("/login")
  }
  
  // Get the public course
  let publicCourse = null
  let userRole = "STUDENT"
  
  if (session?.user?.email) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (dbUser) {
        userRole = dbUser.role
        
        // Get the public course
        publicCourse = await prisma.publicCourse.findUnique({
          where: { public_course_id: params.course_id },
          include: {
            teacher: {
              select: {
                user_id: true,
                name: true,
                email: true,
              },
            },
            units: {
              include: {
                chapters: {
                  orderBy: {
                    order: "asc",
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
            enrollments: {
              include: {
                student: {
                  select: {
                    user_id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        })
        
        if (!publicCourse) {
          redirect("/courses")
        }
        
        // Check if user is the teacher or if course is published
        if (publicCourse.teacher_id !== dbUser.user_id && !publicCourse.isPublished) {
          redirect("/courses")
        }
      } else {
        redirect("/login")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      redirect("/login")
    }
  }
  
  return (
    <PublicCourseClient 
      course={publicCourse} 
      userRole={userRole}
      userId={session?.user?.email ? (await prisma.user.findUnique({ where: { email: session.user.email } }))?.user_id || "" : ""}
    />
  )
}
