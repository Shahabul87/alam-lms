import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { courseId: string } }) {
  try {
    console.log("TEMP UPDATE - courseId:", params.courseId);
    
    // Parse request body
    const values = await req.json();
    console.log("TEMP UPDATE - values:", values);
    
    // For testing, we'll use a hardcoded user ID
    // Replace this with your actual user ID from the database
    const testUserId = "cm4wnqhqr0000uy8ggqkqhqhq"; // You'll need to replace this
    
    // Extract the update fields
    const updateData: any = {};
    
    if (values.title !== undefined) updateData.title = values.title;
    if (values.description !== undefined) updateData.description = values.description;
    if (values.imageUrl !== undefined) updateData.imageUrl = values.imageUrl;
    if (values.price !== undefined) updateData.price = values.price;
    if (values.whatYouWillLearn !== undefined) updateData.whatYouWillLearn = values.whatYouWillLearn;
    if (values.isPublished !== undefined) updateData.isPublished = values.isPublished;
    
    console.log("TEMP UPDATE - updateData:", updateData);
    
    // Check if course exists
    const existingCourse = await db.course.findUnique({
      where: { id: params.courseId }
    });

    if (!existingCourse) {
      return new NextResponse("Course not found", { status: 404 });
    }

    console.log("TEMP UPDATE - found course:", existingCourse.id);

    // Update the course (without user validation for testing)
    const course = await db.course.update({
      where: { id: params.courseId },
      data: updateData,
    });

    console.log("TEMP UPDATE - updated successfully:", course);
    return NextResponse.json(course);
    
  } catch (error: any) {
    console.error("[TEMP_COURSE_UPDATE] Error:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
} 