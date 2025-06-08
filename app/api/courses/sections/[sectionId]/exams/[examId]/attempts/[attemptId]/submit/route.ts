import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { sectionId: string; examId: string; attemptId: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { attemptId } = params;
    const { answers, timeSpent } = await req.json();

    if (!attemptId) {
      return new NextResponse("Attempt ID is required", { status: 400 });
    }

    if (!answers || !Array.isArray(answers)) {
      return new NextResponse("Answers are required", { status: 400 });
    }

    // Get the attempt with exam questions
    const attempt = await db.userExamAttempt.findUnique({
      where: { 
        id: attemptId,
        userId: user.id, // Ensure user can only submit their own attempts
      },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return new NextResponse("Attempt not found", { status: 404 });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return new NextResponse("Attempt is not in progress", { status: 400 });
    }

    // Process and grade each answer
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const gradeQuestion = (question: any, userAnswer: any) => {
      totalPoints += question.points;
      
      let isCorrect = false;
      let pointsEarned = 0;

      switch (question.questionType) {
        case 'MULTIPLE_CHOICE':
          isCorrect = userAnswer === question.correctAnswer;
          break;
        case 'TRUE_FALSE':
          isCorrect = userAnswer === question.correctAnswer;
          break;
        case 'SHORT_ANSWER':
          // For short answer, we'll do a simple case-insensitive comparison
          // In a real app, you might want more sophisticated matching
          isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
          break;
        case 'FILL_IN_BLANK':
          isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
          break;
        case 'MATCHING':
        case 'ORDERING':
          // For matching/ordering, compare arrays
          isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer);
          break;
        case 'ESSAY':
          // Essays need manual grading, so we'll leave them ungraded for now
          isCorrect = null;
          break;
        default:
          isCorrect = false;
      }

      if (isCorrect === true) {
        correctAnswers++;
        pointsEarned = question.points;
        earnedPoints += pointsEarned;
      }

      return { isCorrect, pointsEarned };
    };

    // Create or update user answers
    const answerPromises = answers.map(async (answerData: any) => {
      const question = attempt.exam.questions.find(q => q.id === answerData.questionId);
      if (!question) return null;

      const { isCorrect, pointsEarned } = gradeQuestion(question, answerData.answer);

      // Check if answer already exists
      const existingAnswer = attempt.answers.find(a => a.questionId === answerData.questionId);

      if (existingAnswer) {
        // Update existing answer
        return db.userAnswer.update({
          where: { id: existingAnswer.id },
          data: {
            answer: answerData.answer,
            isCorrect,
            pointsEarned,
            timeSpent: answerData.timeSpent || null,
          },
        });
      } else {
        // Create new answer
        return db.userAnswer.create({
          data: {
            attemptId,
            questionId: answerData.questionId,
            answer: answerData.answer,
            isCorrect,
            pointsEarned,
            timeSpent: answerData.timeSpent || null,
          },
        });
      }
    });

    await Promise.all(answerPromises.filter(Boolean));

    // Calculate score percentage
    const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const isPassed = scorePercentage >= attempt.exam.passingScore;

    // Update attempt status
    const updatedAttempt = await db.userExamAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        timeSpent,
        correctAnswers,
        scorePercentage,
        isPassed,
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
                options: true,
                correctAnswer: true,
                explanation: true,
                imageUrl: true,
                videoUrl: true,
              },
            },
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            showResults: true,
          },
        },
      },
    });

    // Create analytics entries
    const analyticsPromises = [
      // Overall time analytics
      db.examAnalytics.create({
        data: {
          attemptId,
          analyticsType: 'QUESTION_TIME',
          value: timeSpent || 0,
          metadata: { type: 'total_time' },
        },
      }),
      // Score analytics
      db.examAnalytics.create({
        data: {
          attemptId,
          analyticsType: 'DIFFICULTY_SCORE',
          value: scorePercentage,
          metadata: { 
            type: 'final_score',
            correctAnswers,
            totalQuestions: attempt.exam.questions.length,
            earnedPoints,
            totalPoints,
          },
        },
      }),
    ];

    await Promise.all(analyticsPromises);

    return NextResponse.json({
      attempt: updatedAttempt,
      summary: {
        totalQuestions: attempt.exam.questions.length,
        correctAnswers,
        scorePercentage: Math.round(scorePercentage * 100) / 100,
        isPassed,
        earnedPoints,
        totalPoints,
        timeSpent,
      },
    });
  } catch (error) {
    console.error("[EXAM_SUBMIT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 