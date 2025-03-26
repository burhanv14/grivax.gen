import { Star } from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"

// Mock data - would be fetched from an API in a real application
const reviews = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "2 weeks ago",
    content:
      "This course exceeded my expectations. The content is well-structured and the instructor explains complex concepts in a way that's easy to understand. Highly recommended!",
  },
  {
    id: "2",
    name: "Maria Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    date: "1 month ago",
    content:
      "Great course with practical examples. I particularly enjoyed the hands-on projects that helped reinforce the concepts. The only improvement I'd suggest is more advanced exercises.",
  },
  {
    id: "3",
    name: "David Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "2 months ago",
    content:
      "One of the best courses I've taken on this platform. The instructor is knowledgeable and responsive to questions. The course materials are comprehensive and up-to-date.",
  },
]

// Rating distribution
const ratingDistribution = {
  5: 68,
  4: 24,
  3: 5,
  2: 2,
  1: 1,
}

interface CourseReviewsProps {
  courseId: string
}

export default function CourseReviews({ courseId }: CourseReviewsProps) {
  // Calculate average rating
  const totalReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0)
  const weightedSum = Object.entries(ratingDistribution).reduce(
    (sum, [rating, count]) => sum + Number(rating) * count,
    0,
  )
  const averageRating = (weightedSum / totalReviews).toFixed(1)

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
          <div className="mb-2 text-5xl font-bold">{averageRating}</div>
          <div className="mb-4 flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(Number(averageRating)) ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Based on {totalReviews} reviews</p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex w-24 items-center">
                <span className="mr-1 text-sm font-medium">{rating}</span>
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              </div>
              <Progress
                value={(ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100}
                className="h-2 flex-1"
              />
              <div className="w-12 text-right text-sm text-muted-foreground">
                {ratingDistribution[rating as keyof typeof ratingDistribution]}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Student Reviews</h3>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={review.avatar || "/placeholder.svg"}
                      alt={review.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{review.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{review.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

