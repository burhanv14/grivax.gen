"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChapterProgress {
  unit_id: string;
  chapters: number;
}

export default function ProgressPageClient() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/generate-course/${params.user_id}/${params.course_id}/status?ts=${Date.now()}`);
      if (!res.ok && res.status !== 202) {
        throw new Error('Failed to fetch status')
      }
      const data = await res.json();
      setStatus(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching status', err);
      setLoading(false);
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout | null = null;

    const start = async () => {
      const first = await fetchStatus();
      if (!mounted) return;

      interval = setInterval(async () => {
        const s = await fetchStatus();
        if (!s) return;
        // If completed, redirect to course
        if (s.status === 'completed') {
          toast.success('Course generation complete! Redirecting...');
          if (interval) clearInterval(interval);
          router.push(`/courses/${params.user_id}`);
        }
      }, 2500);
    }

    start();

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    }
  }, [params.course_id, params.user_id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-muted-foreground">Preparing generation... please wait.</div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">Failed to load status.</div>
      </div>
    )
  }

  const progress = status.progress || { percent: 0, unitsCreated: 0, totalIntendedUnits: 0, chaptersPerUnit: [] };
  const units = progress.totalIntendedUnits || progress.unitsCreated || 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Generating course: {status.course_id}</h1>
        <p className="text-sm text-muted-foreground">We are creating modules and chapters. This may take a couple of minutes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: units }).map((_, idx) => {
          const unitProgress = status.progress?.chaptersPerUnit?.[idx];
          // Dummy per-week percentage: if chapters >0 consider 100, else 0. Could be refined.
          const percent = unitProgress ? Math.min(100, Math.round((unitProgress.chapters / Math.max(1, 3)) * 100)) : 0;
          const completed = percent >= 100;

          return (
            <Card key={idx} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Week {idx + 1}</span>
                  {completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Badge variant="outline" className="text-xs">{percent}%</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">Module generation progress</div>
                <Progress value={percent} className="h-3" />
                <div className="mt-3 text-xs text-muted-foreground">{unitProgress ? `${unitProgress.chapters} chapters created` : 'Pending'}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <div className="text-sm text-muted-foreground">Overall progress: {progress.percent}%</div>
        <div className="mt-2">
          <Progress value={progress.percent} className="h-3 w-96 mx-auto" />
        </div>
      </div>
    </div>
  )
}
