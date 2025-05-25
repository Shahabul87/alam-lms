import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    console.log("[TEST_COURSE_UPDATE] Starting test...");
    
    const user = await currentUser();
    console.log("[TEST_COURSE_UPDATE] User:", user ? "Authenticated" : "Not authenticated");
    
    if (!user?.id) {
      return NextResponse.json({
        success: false,
        error: "User not authenticated",
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    // Get the first course owned by the user
    const course = await db.course.findFirst({
      where: {
        userId: user.id
      }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        error: "No courses found for user",
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    console.log("[TEST_COURSE_UPDATE] Found course:", course.id);

    // Test updating the course description
    const testDescription = `Test update at ${new Date().toISOString()}`;
    
    const updatedCourse = await db.course.update({
      where: {
        id: course.id,
        userId: user.id
      },
      data: {
        description: testDescription
      }
    });

    console.log("[TEST_COURSE_UPDATE] Course updated successfully");

    return NextResponse.json({
      success: true,
      message: "Course update test successful",
      courseId: course.id,
      originalDescription: course.description,
      newDescription: testDescription,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error("[TEST_COURSE_UPDATE] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 