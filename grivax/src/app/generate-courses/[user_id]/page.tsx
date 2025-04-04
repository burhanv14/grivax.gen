'use client';

import { useState } from 'react';
import { loginIsRequiredServer } from "@/lib/auth";
import { useRouter } from 'next/navigation';
import { Loader2, BookOpen } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import GeneratedCourseGrid from '@/components/generated-course-grid';
import { Filter, Plus } from "lucide-react"
import CourseGrid from "@/components/course-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

interface CourseModule {
  week: number;
  title: string;
  objectives: string[];
  resources: Array<{
    type: string;
    title: string;
    url: string;
  }>;
}

export default function GenerateCoursePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [inputs, setInputs] = useState({
    topic: '',
    difficulty: 'beginner',
    pace: '5 hours/week'
  });
  const [course, setCourse] = useState<CourseModule[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const recommendedCourses = [
    {
      id: "rec1",
      title: "Machine Learning Fundamentals",
      description: "Learn the basics of machine learning algorithms and applications.",
      image: "/placeholder.svg?height=200&width=300",
      category: "Technology",
      level: "Intermediate",
      rating: 4.8,
    },
    {
      id: "rec2",
      title: "Data Science with Python",
      description: "Master data analysis and visualization using Python libraries.",
      image: "/placeholder.svg?height=200&width=300",
      category: "Technology",
      level: "Beginner",
      rating: 4.6,
    },
    {
      id: "rec3",
      title: "Web Development Bootcamp",
      description: "Comprehensive guide to modern web development technologies.",
      image: "/placeholder.svg?height=200&width=300",
      category: "Programming",
      level: "Beginner",
      rating: 4.9,
    },
  ]

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inputs,
          userId: params.userId
        })
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCourse(data.modules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate course');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleAccept = () => {
    setCourse(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Generate Your Course</h1>
        <p className="text-muted-foreground">
          Create a personalized course by specifying your topic, difficulty level, and learning pace.
        </p>
      </div>

      {!course ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">What would you like to learn?</label>
                <Input
                  type="text"
                  value={inputs.topic}
                  onChange={(e) => setInputs({...inputs, topic: e.target.value})}
                  placeholder="e.g., Machine Learning, Web Development, Digital Marketing"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-4">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <Button
                      key={level}
                      variant={inputs.difficulty === level ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setInputs({...inputs, difficulty: level})}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Learning Pace</label>
                <div className="grid grid-cols-3 gap-4">
                  {['2 hours/week', '5 hours/week', '10 hours/week'].map((pace) => (
                    <Button
                      key={pace}
                      variant={inputs.pace === pace ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setInputs({...inputs, pace})}
                    >
                      {pace}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={loading || !inputs.topic}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Course...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Generate Course
                  </>
                )}
              </Button>

              {loading && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    {progress < 90 ? 'Generating your personalized course...' : 'Finalizing your course...'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <GeneratedCourseGrid 
          modules={course}
          userId={params.userId}
          onAccept={handleAccept}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
       <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Input type="search" placeholder="Search courses..." className="pr-10" />
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
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <Button variant="outline" size="sm" className="sm:ml-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-12">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <CourseGrid />
        </TabsContent>
        <TabsContent value="popular">
          <CourseGrid filter="popular" />
        </TabsContent>
        <TabsContent value="new">
          <CourseGrid filter="new" />
        </TabsContent>
        <TabsContent value="beginner">
          <CourseGrid filter="beginner" />
        </TabsContent>
        <TabsContent value="advanced">
          <CourseGrid filter="advanced" />
        </TabsContent>
      </Tabs>

      {/* Recommended Courses Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Recommended For You</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {course.category}
                  </span>
                  <span className="inline-flex items-center text-xs text-muted-foreground">{course.level}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
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
                      className="mr-1 h-4 w-4 fill-primary text-primary"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
} 