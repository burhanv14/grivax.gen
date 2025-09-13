"use client";

import { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProgressUnit {
  unit_id: string;
  chapters: number;
}

interface StatusResponse {
  status: 'generating' | 'completed';
  message: string;
  course_id: string;
  user_id: string;
  progress?: {
    percent: number;
    unitsCreated: number;
    completedUnits: number;
    totalIntendedUnits: number;
    totalChapters: number;
    chaptersPerUnit: ProgressUnit[];
  }
}

/**
 * Poll-based progress widget for course generation.
 * Uses lightweight polling instead of SSE/WebSockets to minimize infra changes.
 * Redirect / UI actions are handled by parent through onComplete callback.
 */
export default function CourseGenerationProgress({ userId, courseId, onComplete }: { userId: string; courseId: string; onComplete?: () => void }) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll status endpoint
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/generate-course/${userId}/${courseId}/status?ts=${Date.now()}`);
        const data: StatusResponse = await res.json();
        setStatus(data);
        if (data.status === 'completed') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete?.();
        }
      } catch (e) {
        console.error('Progress fetch failed', e);
        setError('Failed to fetch progress');
      }
    };

    // Initial fetch
    fetchStatus();
    // Start polling
    intervalRef.current = setInterval(fetchStatus, 2500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, courseId, onComplete]);

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!status) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Starting generation...</div>;
  }

  const percent = status.progress?.percent ?? (status.status === 'completed' ? 100 : 0);
  const totalUnits = status.progress?.totalIntendedUnits ?? status.progress?.unitsCreated ?? 0;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Course Generation
          {status.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{status.status === 'completed' ? 'Completed' : 'Generating...'}</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalUnits }).map((_, idx) => {
              const unitProgress = status.progress?.chaptersPerUnit?.[idx];
              const hasChapters = unitProgress && unitProgress.chapters > 0;
              return (
                <Badge key={idx} variant={hasChapters ? 'default' : 'outline'} className="text-xs px-2 py-1">
                  Unit {idx + 1} {hasChapters ? '✓' : ''}
                </Badge>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tracking {status.progress?.unitsCreated ?? 0}/{totalUnits} units generated.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
