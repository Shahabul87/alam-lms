import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Test database connection
    const courseCount = await db.course.count();
    
    return NextResponse.json({
      message: "Simple course test working",
      courseCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const courseId = body.courseId || '0de92129-c605-4d0e-80c3-2d44790a501b';
    
    // Try to find and update the course
    const course = await db.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    
    // Update the course
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: { 
        description: body.description || `Updated at ${new Date().toISOString()}`
      }
    });
    
    return NextResponse.json({
      success: true,
      course: updatedCourse,
      message: "Course updated successfully!"
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 