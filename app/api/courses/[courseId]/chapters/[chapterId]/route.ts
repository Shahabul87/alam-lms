import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await params to get courseId and chapterId
    const { courseId, chapterId } = await params;

    // First check if the authenticated user owns the course
    const courseOwner = await db.course.findFirst({
      where: {
        id: courseId,
        userId: userId,
      }
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the chapter to be deleted
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      }
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // Delete the chapter
    const deletedChapter = await db.chapter.delete({
      where: {
        id: chapterId
      }
    });

    // Reorder the remaining chapters
    const remainingChapters = await db.chapter.findMany({
      where: {
        courseId: courseId,
        position: {
          gt: chapter.position
        }
      },
      orderBy: {
        position: "asc"
      }
    });

    // Update the positions of the remaining chapters
    for (const item of remainingChapters) {
      await db.chapter.update({
        where: {
          id: item.id
        },
        data: {
          position: item.position - 1
        }
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.error("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const user = await currentUser();
    const userId = user?.id;
    const { isPublished, ...values } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await params to get courseId and chapterId
    const { courseId, chapterId } = await params;

    // First check if the authenticated user owns the course
    const courseOwner = await db.course.findFirst({
      where: {
        id: courseId,
        userId: userId,
      }
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the chapter with the provided values
    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        ...values,
      }
    });

    // If the publishing status was provided, handle that separately
    if (isPublished !== undefined) {
      await db.chapter.update({
        where: {
          id: chapterId,
          courseId: courseId,
        },
        data: {
          isPublished
        }
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


