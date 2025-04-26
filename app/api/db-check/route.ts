import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Publicly accessible route to check database connectivity and counts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  console.log("🔍 DB Check API called");
  
  try {
    // Get counts of various tables
    const counts = {
      courses: await db.course.count({
        where: { isPublished: true }
      }),
      blogs: await db.blog.count({
        where: { isPublished: true }
      }),
      users: await db.user.count(),
      chapters: await db.chapter.count({
        where: { isPublished: true }
      })
    };
    
    // Get sample entries for debugging
    const sampleCourse = await db.course.findFirst({
      where: { isPublished: true },
      select: { id: true, title: true }
    });
    
    const sampleBlog = await db.blog.findFirst({
      where: { isPublished: true },
      select: { id: true, title: true }
    });
    
    // Check connection is working
    const dbInfo = {
      connected: true,
      counts,
      samples: {
        course: sampleCourse,
        blog: sampleBlog
      }
    };
    
    console.log("✅ Database check complete:", dbInfo);
    
    return NextResponse.json(dbInfo);
  } catch (error) {
    console.error("❌ Database check error:", error);
    
    return NextResponse.json(
      { 
        connected: false, 
        error: 'Database connection error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 