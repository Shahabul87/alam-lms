import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Force Node.js runtime
export const runtime = 'nodejs';

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId: session.user.id,
      }
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    await db.course.delete({
      where: {
        id: courseId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    console.log("PATCH request received for courseId:", courseId);
    
    const session = await auth();
    console.log("Session:", session ? "Valid" : "Invalid");
    
    if (!session?.user?.id) {
      console.log("Authentication failed: No user ID in session");
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const values = await req.json();
    console.log("Request body values:", values);
    console.log("Authenticated user ID:", session.user.id);

    const updateData: any = {};
    
    if (values.title !== undefined) updateData.title = values.title;
    if (values.description !== undefined) updateData.description = values.description;
    if (values.imageUrl !== undefined) updateData.imageUrl = values.imageUrl;
    if (values.price !== undefined) updateData.price = values.price;
    if (values.whatYouWillLearn !== undefined) updateData.whatYouWillLearn = values.whatYouWillLearn;
    if (values.isPublished !== undefined) updateData.isPublished = values.isPublished;
    
    if (values.categoryId !== undefined) {
      if (values.categoryId) {
        try {
          let category = await db.category.findUnique({
            where: { id: values.categoryId }
          });
          
          if (!category) {
            const categoryName = values.categoryId
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
              
            console.log("Looking for or creating category with name:", categoryName);
            
            category = await db.category.findFirst({
              where: {
                name: {
                  equals: categoryName,
                  mode: 'insensitive'
                }
              }
            });
            
            if (!category) {
              category = await db.category.create({
                data: {
                  id: values.categoryId,
                  name: categoryName,
                }
              });
              console.log("Created new category:", category);
            }
          }
          
          updateData.categoryId = category.id;
          console.log("Using category:", category);
        } catch (categoryError: any) {
          console.error("Error handling category:", categoryError);
        }
      } else {
        updateData.categoryId = null;
      }
    }

    console.log("Prepared update data:", updateData);
    
    if (Object.keys(updateData).length === 0) {
      console.log("No fields to update in request");
      return new NextResponse("No fields to update", { status: 400 });
    }

    const existingCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId: session.user.id,
      }
    });

    if (!existingCourse) {
      console.log("Course not found or doesn't belong to user");
      console.log("User ID:", session.user.id);
      console.log("Course ID:", courseId);
      return new NextResponse("Course not found", { status: 404 });
    }

    console.log("Found existing course:", existingCourse.id);

    try {
      const course = await db.course.update({
        where: {
          id: courseId,
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