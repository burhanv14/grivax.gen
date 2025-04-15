import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, modules, status } = body;

    if (!user_id || !modules || !Array.isArray(modules) || modules.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    console.log('Creating course with data:', {
      user_id,
      moduleCount: modules.length,
      firstModuleTitle: modules[0].title
    });

    // Create the course in the database
    const course = await db.course.create({
      data: {
        user_id,
        title: modules[0].title,
        description: `A ${modules.length}-week course covering ${modules[0].title}`,
        status: status || 'active',
        modules: {
          create: modules.map((module: any, index: number) => ({
            week: module.week || index + 1,
            title: module.title,
            objectives: module.objectives || [],
            resources: module.resources || []
          }))
        }
      },
      include: {
        modules: true
      }
    });

    console.log('Course created successfully:', course.id);

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error in /api/courses:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save course',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 