import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

// Force Node.js runtime
export const runtime = 'nodejs';

export async function DELETE(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First verify the course belongs to the user
    const course = await db.course.findUnique({
      where: {
        id: resolvedParams.courseId,
        userId: session.user.id,
      }
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Delete the course
    await db.course.delete({
      where: {
        id: resolvedParams.courseId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


export async function PATCH(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  try {
    console.log("PATCH request received for courseId:", resolvedParams.courseId);
    
    // Get user session
    const session = await auth();
    console.log("Session:", session ? "Valid" : "Invalid");
    
    if (!session?.user?.id) {
      console.log("Authentication failed: No user ID in session");
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Parse request body
    const values = await req.json();
    console.log("Request body values:", values);
    
    console.log("Authenticated user ID:", session.user.id);

    // Extract the update fields from the request body
    const updateData: any = {};
    
    // Check for each possible field and add to update data if present
    if (values.title !== undefined) updateData.title = values.title;
    if (values.description !== undefined) updateData.description = values.description;
    if (values.imageUrl !== undefined) updateData.imageUrl = values.imageUrl;
    if (values.price !== undefined) updateData.price = values.price;
    if (values.whatYouWillLearn !== undefined) updateData.whatYouWillLearn = values.whatYouWillLearn;
    if (values.isPublished !== undefined) updateData.isPublished = values.isPublished;
    
    // Special handling for categoryId
    if (values.categoryId !== undefined) {
      if (values.categoryId) {
        try {
          // Check if the category exists
          let category = await db.category.findUnique({
            where: { id: values.categoryId }
          });
          
          // If not found, check if it's a predefined ID from the CATEGORIES_BY_GROUP list
          if (!category) {
            // Try to find by converting ID to a name (e.g., "machine-learning-ai" → "Machine Learning & AI")
            const categoryName = values.categoryId
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
              
            console.log("Looking for or creating category with name:", categoryName);
            
            // Check if category exists with this name
            category = await db.category.findFirst({
              where: {
                name: {
                  equals: categoryName,
                  mode: 'insensitive'
                }
              }
            });
            
            // If still not found, create the category
            if (!category) {
              category = await db.category.create({
                data: {
                  id: values.categoryId, // Use the provided ID
                  name: categoryName,
                }
              });
              console.log("Created new category:", category);
            }
          }
          
          // Now use the validated/created category ID
          updateData.categoryId = category.id;
          console.log("Using category:", category);
        } catch (categoryError: any) {
          console.error("Error handling category:", categoryError);
          // Continue with the update without the category rather than failing
          // This is a fallback in case category handling fails
        }
      } else {
        // If categoryId is null, we're removing the category
        updateData.categoryId = null;
      }
    }

    console.log("Prepared update data:", updateData);
    
    // Only update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      console.log("No fields to update in request");
      return new NextResponse("No fields to update", { status: 400 });
    }

    // First check if the course exists and belongs to the user
    const existingCourse = await db.course.findUnique({
      where: {
        id: resolvedParams.courseId,
        userId: session.user.id,
      }
    });

    if (!existingCourse) {
      console.log("Course not found or doesn't belong to user");
      console.log("User ID:", session.user.id);
      console.log("Course ID:", resolvedParams.courseId);
      return new NextResponse("Course not found", { status: 404 });
    }

    console.log("Found existing course:", existingCourse.id);

    try {
      // Update the course
      const course = await db.course.update({
        where: {
          id: resolvedParams.courseId,
          userId: session.user.id,
        },
        data: updateData,
      });

      console.log("Course updated successfully:", course);
      return NextResponse.json(course);
    } catch (dbError: any) {
      console.error("Database error during update:", dbError);
      return new NextResponse(`Database Error: ${dbError.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error("[COURSE_PATCH] Detailed error:", error);
    if (error.name === "SyntaxError") {
      return new NextResponse("Invalid JSON in request body", { status: 400 });
    }
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}