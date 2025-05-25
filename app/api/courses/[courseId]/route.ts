import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

// Force Node.js runtime
export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    console.log("[COURSE_DELETE] Starting deletion for courseId:", courseId);
    
    const user = await currentUser();

    if (!user?.id) {
      console.log("[COURSE_DELETE] Authentication failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[COURSE_DELETE] Authenticated user:", user.id);

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId: user.id,
      }
    });

    if (!course) {
      console.log("[COURSE_DELETE] Course not found or doesn't belong to user");
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.course.delete({
      where: {
        id: courseId,
      }
    });

    console.log("[COURSE_DELETE] Course deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COURSE_DELETE] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    console.log("[COURSE_PATCH] Starting update for courseId:", courseId);
    
    const user = await currentUser();
    
    if (!user?.id) {
      console.log("[COURSE_PATCH] Authentication failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log("[COURSE_PATCH] Authenticated user:", user.id);
    
    const values = await request.json();
    console.log("[COURSE_PATCH] Request body values:", values);

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
              
            console.log("[COURSE_PATCH] Looking for or creating category:", categoryName);
            
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
              console.log("[COURSE_PATCH] Created new category:", category);
            }
          }
          
          updateData.categoryId = category.id;
          console.log("[COURSE_PATCH] Using category:", category);
        } catch (categoryError: any) {
          console.error("[COURSE_PATCH] Error handling category:", categoryError);
        }
      } else {
        updateData.categoryId = null;
      }
    }

    console.log("[COURSE_PATCH] Prepared update data:", updateData);
    
    if (Object.keys(updateData).length === 0) {
      console.log("[COURSE_PATCH] No fields to update");
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const existingCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId: user.id,
      }
    });

    if (!existingCourse) {
      console.log("[COURSE_PATCH] Course not found or doesn't belong to user");
      console.log("[COURSE_PATCH] User ID:", user.id);
      console.log("[COURSE_PATCH] Course ID:", courseId);
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    console.log("[COURSE_PATCH] Found existing course:", existingCourse.id);

    try {
      const course = await db.course.update({
        where: {
          id: courseId,
          userId: user.id,
        },
        data: updateData,
      });

      console.log("[COURSE_PATCH] Course updated successfully:", course);
      return NextResponse.json(course);
    } catch (dbError: any) {
      console.error("[COURSE_PATCH] Database error during update:", dbError);
      return NextResponse.json({ error: `Database Error: ${dbError.message}` }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[COURSE_PATCH] Detailed error:", error);
    if (error.name === "SyntaxError") {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    return NextResponse.json({ error: `Internal Error: ${error.message}` }, { status: 500 });
  }
}