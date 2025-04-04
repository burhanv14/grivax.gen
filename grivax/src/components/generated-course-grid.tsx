'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Video, FileText, Book, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Resource {
  type: string;
  title: string;
  url: string;
}

interface CourseModule {
  week: number;
  title: string;
  objectives: string[];
  resources: Resource[];
}

interface GeneratedCourseGridProps {
  modules: CourseModule[];
  userId: string;
  onAccept: () => void;
}

export default function GeneratedCourseGrid({ modules, userId, onAccept }: GeneratedCourseGridProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    if (!modules || modules.length === 0) {
      toast.error('No course modules to save');
      return;
    }

    setIsAccepting(true);
    try {
      // Validate and format the data
      const formattedModules = modules.map((module, index) => ({
        week: module.week || index + 1,
        title: module.title || `Module ${index + 1}`,
        objectives: Array.isArray(module.objectives) ? module.objectives : [],
        resources: Array.isArray(module.resources) ? module.resources.map(resource => ({
          type: resource.type || 'article',
          title: resource.title || 'Resource',
          url: resource.url || '#'
        })) : []
      }));

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          modules: formattedModules,
          status: 'active'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save course');
      }

      toast.success('Course added to your collection!');
      onAccept();
      router.refresh(); // Refresh the page data
      router.push('/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save course. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (!modules || modules.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No course modules generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Generated Course</h2>
          <p className="text-muted-foreground">
            Review the course structure below. Click "Accept" to add it to your collection.
          </p>
        </div>
        <Button 
          onClick={handleAccept}
          disabled={isAccepting}
          className="gap-2"
        >
          {isAccepting ? (
            <>
              <CheckCircle2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Accept Course
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => (
          <Card 
            key={module.week || index}
            className="group transition-all hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">Week {module.week || index + 1}</Badge>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors">
                  {module.title || `Module ${index + 1}`}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 mt-1 text-primary" />
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {(module.objectives || []).map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Book className="h-4 w-4 text-primary" />
                  Learning Resources
                </h4>
                <div className="space-y-3">
                  {(module.resources || []).map((resource, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {resource.type === 'video' ? (
                        <Video className="h-4 w-4 mt-1 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 mt-1 text-primary" />
                      )}
                      <a
                        href={resource.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {resource.title || 'Resource'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 