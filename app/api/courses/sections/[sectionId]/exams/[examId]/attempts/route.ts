import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { sectionId: string; examId: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { examId } = params;

    if (!examId) {
      return new NextResponse("Exam ID is required", { status: 400 });
    }

    // Get user's exam attempts
    const attempts = await db.userExamAttempt.findMany({
      where: {
        examId,
        userId: user.id,
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
                order: true,
                correctAnswer: true, // Include for completed attempts
                explanation: true,
              },
            },
          },
        },
        analytics: true,
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            attempts: true,
            passingScore: true,
            showResults: true,
          },
        },
      },
      orderBy: {
        attemptNumber: 'desc',
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("[EXAM_ATTEMPTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sectionId: string; examId: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { examId } = params;

    if (!examId) {
      return new NextResponse("Exam ID is required", { status: 400 });
    }

    // Check if exam exists and is available
    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        userAttempts: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!exam) {
      return new NextResponse("Exam not found", { status: 404 });
    }

    if (!exam.isPublished || !exam.isActive) {
      return new NextResponse("Exam is not available", { status: 400 });
    }

    // Check if exam is within the allowed time window
    const now = new Date();
    if (exam.startDate && now < exam.startDate) {
      return new NextResponse("Exam has not started yet", { status: 400 });
    }
    if (exam.endDate && now > exam.endDate) {
      return new NextResponse("Exam has ended", { status: 400 });
    }

    // Check if user has exceeded the allowed number of attempts
    const completedAttempts = exam.userAttempts.filter(
      attempt => attempt.status === 'SUBMITTED' || attempt.status === 'GRADED'
    );

    if (completedAttempts.length >= exam.attempts) {
      return new NextResponse("Maximum number of attempts exceeded", { status: 400 });
    }

    // Check if user has an ongoing attempt
    const ongoingAttempt = exam.userAttempts.find(
      attempt => attempt.status === 'IN_PROGRESS'
    );

    if (ongoingAttempt) {
      // Return the ongoing attempt
      const attemptWithDetails = await db.userExamAttempt.findUnique({
        where: { id: ongoingAttempt.id },
        include: {
          answers: {
            include: {
              question: {
                select: {
                  id: true,
                  question: true,
                  questionType: true,
                  points: true,
                  order: true,
                  options: true,
                  imageUrl: true,
                  videoUrl: true,
                  // Don't include correct answers for ongoing attempts
                },
              },
            },
          },
          exam: {
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
                  // Don't include correct answers for ongoing attempts
                },
              },
            },
          },
        },
      });

      return NextResponse.json(attemptWithDetails);
    }

    // Create new attempt
    const nextAttemptNumber = exam.userAttempts.length + 1;

    const newAttempt = await db.userExamAttempt.create({
      data: {
        userId: user.id,
        examId,
        attemptNumber: nextAttemptNumber,
        totalQuestions: exam.questions.length,
        status: 'IN_PROGRESS',
      },
      include: {
        exam: {
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
                // Don't include correct answers for new attempts
              },
            },
          },
        },
        answers: true,
      },
    });

    return NextResponse.json(newAttempt);
  } catch (error) {
    console.error("[EXAM_ATTEMPTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 