'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { loginIsRequiredServer } from "@/lib/auth";
import { useRouter } from 'next/navigation';
import { Loader2, BookOpen } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import GeneratedCourseGrid from '@/components/generated-course-grid';

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
    </div>
  );
} 