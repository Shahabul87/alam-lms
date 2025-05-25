import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Force Node.js runtime
export const runtime = 'nodejs';

// Reorder learning objectives
export async function PATCH(
  req: Request, 
  props: { params: Promise<{ courseId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    const { fromIndex, toIndex } = await req.json();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    if (
      typeof fromIndex !== 'number' || 
      typeof toIndex !== 'number' || 
      fromIndex < 0 || 
      toIndex < 0
    ) {
      return new NextResponse("Invalid indices", { status: 400 });
    }
    
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: session.user.id,
      },
      select: {
        whatYouWillLearn: true,
        userId: true,
      }
    });
    
    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }
    
    const objectives = course.whatYouWillLearn || [];
    
    if (fromIndex >= objectives.length || toIndex >= objectives.length) {
      return new NextResponse("Invalid indices", { status: 400 });
    }
    
    // Perform the reordering
    const updatedObjectives = [...objectives];
    const [movedItem] = updatedObjectives.splice(fromIndex, 1);
    updatedObjectives.splice(toIndex, 0, movedItem);
    
    const updatedCourse = await db.course.update({
      where: {
        id: params.courseId,
        userId: session.user.id,
      },
      data: {
        whatYouWillLearn: updatedObjectives,
      },
    });
    
    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.log("[OBJECTIVE_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 