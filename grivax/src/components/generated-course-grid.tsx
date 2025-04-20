'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CourseModule {
  week: number;
  title: string;
  objectives: string[];
  timeSpent: string;
}

interface CourseData {
  course_id: string;
  title: string;
  description: string;
  modules: CourseModule[];
}

interface GeneratedCourseGridProps {
  courseData: CourseData;
}

export function GeneratedCourseGrid({ courseData }: GeneratedCourseGridProps) {
  const formattedModules = (courseData.modules || []).map((module: CourseModule, index: number) => ({
    week: module.week || index + 1,
    title: module.title || `Module ${index + 1}`,
    objectives: Array.isArray(module.objectives) ? module.objectives : [],
    timeSpent: module.timeSpent || '0 hours'
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {formattedModules.map((module, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Week {module.week}: {module.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Objectives:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {module.objectives.map((objective: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Time Required:</span> {module.timeSpent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 