import { BookOpen, CheckCircle, Clock, FileText } from "lucide-react"

// Mock data - would be fetched from an API in a real application
const activities = [
  {
    id: "1",
    type: "course_progress",
    title: "Machine Learning Fundamentals",
    description: "Completed Module 2: Supervised Learning",
    timestamp: "2 hours ago",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    id: "2",
    type: "quiz_completed",
    title: "Data Science Essentials",
    description: "Scored 85% on the quiz",
    timestamp: "Yesterday",
    icon: FileText,
    iconColor: "text-purple-500",
  },
  {
    id: "3",
    type: "course_started",
    title: "Advanced Web Development",
    description: "Started a new course",
    timestamp: "2 days ago",
    icon: BookOpen,
    iconColor: "text-blue-500",
  },
  {
    id: "4",
    type: "course_progress",
    title: "UI/UX Design Principles",
    description: "Watched 3 lessons in Module 1",
    timestamp: "3 days ago",
    icon: Clock,
    iconColor: "text-amber-500",
  },
  {
    id: "5",
    type: "quiz_completed",
    title: "JavaScript Fundamentals",
    description: "Scored 92% on the quiz",
    timestamp: "4 days ago",
    icon: FileText,
    iconColor: "text-purple-500",
  },
]

export default function RecentActivity() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className={`rounded-full bg-background p-2 ${activity.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{activity.title}</h4>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

