import { BookOpen, GraduationCap, LineChart, Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RecentActivity from "@/components/recent-activity"
import EnrolledCourses from "@/components/enrolled-courses"
import QuizResults from "@/components/quiz-results"

export const metadata = {
  title: "Dashboard | Grivax.gen",
  description: "Track your learning progress and achievements",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="text-muted-foreground">Track your progress, manage your courses, and view your achievements.</p>
        </div>
        <Button asChild>
          <Link href="/courses">Explore Courses</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">+8 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Your overall progress across all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Machine Learning Fundamentals</div>
                  <div className="text-sm text-muted-foreground">75%</div>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Web Development Bootcamp</div>
                  <div className="text-sm text-muted-foreground">92%</div>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Data Science with Python</div>
                  <div className="text-sm text-muted-foreground">45%</div>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">UI/UX Design Principles</div>
                  <div className="text-sm text-muted-foreground">60%</div>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Your learning activity for the past week</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">+12% from last week</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              {/* This would be a chart component in a real application */}
              <div className="flex h-full items-end gap-2">
                <div className="flex h-[30%] w-full flex-col justify-end rounded-md bg-primary/20 p-2">
                  <div className="h-full w-full rounded-sm bg-primary"></div>
                </div>
                <div className="flex h-[45%] w-full flex-col justify-end rounded-md bg-primary/20 p-2">
                  <div className="h-full w-full rounded-sm bg-primary"></div>
                </div>
                <div className="flex h-[65%] w-full flex-col justify-end rounded-md bg-primary/20 p-2">
                  <div className="h-full w-full rounded-sm bg-primary"></div>
                </div>
                <div className="flex h-[40%] w-full flex-col justify-end rounded-md bg-primary/20 p-2">
                  <div className="h-full w-full rounded-sm bg-primary"></div>
                </div>
                <div className="flex h-[80%] w-full flex-col justify-end rounded-md bg-primary/20 p-2">
                  <div className="h-full w-full rounded-sm bg-primary"></div>
                </div>
                <div className="flex h-[55%] w-full flex-col justify-end rounded-md bg-primary/20 p-2">
                  <div className="h-full w-full rounded-sm bg-primary"></div>
                </div>
                <div className="flex h-[35%] w-full flex-col justify-end rounded-md bg-primary/20 p-2">
                  <div className="h-full w-full rounded-sm bg-primary"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="activity">
          <TabsList className="mb-6">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="courses">Enrolled Courses</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Results</TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <RecentActivity />
          </TabsContent>
          <TabsContent value="courses">
            <EnrolledCourses />
          </TabsContent>
          <TabsContent value="quizzes">
            <QuizResults />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

