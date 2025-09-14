import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch courses for the user
    const courses = await prisma.course.findMany({
      where: {
        user_id: user.user_id
      },
      include: {
        units: {
          include: {
            chapters: true
          }
        },
        quiz: {
          include: {
            attempts: {
              where: {
                user_id: user.user_id
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      courses: courses 
    });

  } catch (error) {
    console.error('Error fetching user courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}