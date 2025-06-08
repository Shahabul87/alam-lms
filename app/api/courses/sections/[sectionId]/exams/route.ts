import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { sectionId: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { sectionId } = params;

    if (!sectionId) {
      return new NextResponse("Section ID is required", { status: 400 });
    }

    // Get all exams for the section with user's attempts
    const exams = await db.exam.findMany({
      where: {
        sectionId,
        isPublished: true,
        isActive: true,
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            question: true,
            questionType: true,
            points: true,
            order: true,
            options: true,
            imageUrl: true,
            videoUrl: true,
            // Don't include correct answers
          },
        },
        userAttempts: {
          where: {
            userId: user.id,
          },
          orderBy: {
            attemptNumber: 'desc',
          },
          include: {
            answers: {
              include: {
                question: {
                  select: {
                    id: true,
                    question: true,
                    questionType: true,
                    points: true,
                  },
                },
              },
            },
            analytics: true,
          },
        },
        section: {
          select: {
            id: true,
            title: true,
            chapter: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("[SECTION_EXAMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sectionId: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { sectionId } = params;
    const values = await req.json();

    if (!sectionId) {
      return new NextResponse("Section ID is required", { status: 400 });
    }

    // Check if user has permission to create exams (could be admin or instructor)
    const section = await db.section.findUnique({
      where: { id: sectionId },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                userId: true, // Course creator
              },
            },
          },
        },
      },
    });

    if (!section) {
      return new NextResponse("Section not found", { status: 404 });
    }

    // For now, only allow course creator to create exams
    if (section.chapter.course.userId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const exam = await db.exam.create({
      data: {
        title: values.title,
        description: values.description,
        instructions: values.instructions,
        timeLimit: values.timeLimit,
        attempts: values.attempts || 1,
        passingScore: values.passingScore || 70,
        shuffleQuestions: values.shuffleQuestions || false,
        showResults: values.showResults ?? true,
        startDate: values.startDate ? new Date(values.startDate) : null,
        endDate: values.endDate ? new Date(values.endDate) : null,
        isPublished: values.isPublished || false,
        isActive: values.isActive ?? true,
        sectionId,
      },
      include: {
        questions: true,
        userAttempts: true,
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("[SECTION_EXAMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 