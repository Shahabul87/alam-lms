import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Helper function for safer error responses
const createErrorResponse = (message: string, status = 500) => {
  console.error(`[NESTED_REPLY_REACTIONS_POST] Error: ${message}`);
  return NextResponse.json(
    { error: message },
    { status }
  );
};

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ postId: string; commentId: string; replyId: string }> }
) {
  // Declare user at the top level of the function
  let user;
  
  try {
    // Get user session
    try {
      user = await currentUser();
      if (!user) {
        return createErrorResponse("Unauthorized", 401);
      }
    } catch (sessionError) {
      console.error("[NESTED_REPLY_REACTIONS_POST] Session Error:", sessionError);
      return createErrorResponse("Authentication error. Please sign in again.", 401);
    }

    // Safely parse the request body
    let type;
    try {
      const body = await req.json();
      type = body.type;
    } catch (parseError) {
      console.error("[NESTED_REPLY_REACTIONS_POST] JSON Parse Error:", parseError);
      return createErrorResponse("Invalid request format", 400);
    }

    if (!type) {
      return createErrorResponse("Reaction type is required", 400);
    }

    // Get the params
    const params = await props.params;
    const { replyId, commentId, postId } = params;

    // Validate parameters
    if (!postId || typeof postId !== 'string') {
      return createErrorResponse("Invalid post ID", 400);
    }
    
    if (!commentId || typeof commentId !== 'string') {
      return createErrorResponse("Invalid comment ID", 400);
    }
    
    if (!replyId || typeof replyId !== 'string') {
      return createErrorResponse("Invalid reply ID", 400);
    }

    console.log("[NESTED_REPLY_REACTIONS_POST]", { replyId, commentId, postId, type, userId: user.id });

    // First verify the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return createErrorResponse("Post not found", 404);
    }

    // Then verify the comment exists
    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        postId,
      },
      select: { id: true }
    });

    if (!comment) {
      return createErrorResponse("Comment not found", 404);
    }

    // Finally verify the reply exists and belongs to the comment
    const reply = await db.reply.findFirst({
      where: {
        id: replyId,
        commentId,
        postId,
      },
      include: {
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!reply) {
      console.log("Reply not found with:", { replyId, commentId, postId });
      return createErrorResponse("Reply not found", 404);
    }

    // Store the user ID to ensure it's accessible in the transaction
    const userId = user.id;
    
    // Handle the reaction in a transaction
    const result = await db.$transaction(async (tx) => {
      // Check for existing reaction
      const existingReaction = await tx.reaction.findFirst({
        where: {
          userId: userId, // Use the variable from outside the transaction
          replyId,
          type,
        },
      });

      if (existingReaction) {
        // Remove existing reaction (toggle off)
        await tx.reaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
      } else {
        // Remove any existing reactions by this user on this reply (one reaction type per user)
        await tx.reaction.deleteMany({
          where: {
            userId: userId, // Use the variable from outside the transaction
            replyId,
          },
        });

        // Create new reaction
        await tx.reaction.create({
          data: {
            type,
            userId: userId, // Use the variable from outside the transaction
            replyId,
          },
        });
      }

      // Get updated reply with reactions
      const updatedReply = await tx.reply.findUnique({
        where: {
          id: replyId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return updatedReply;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[NESTED_REPLY_REACTIONS_POST]", error);
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("database") || error.message.includes("prisma")) {
        return createErrorResponse("Database error. Please try again later.", 500);
      }
    }
    
    return createErrorResponse("Internal server error", 500);
  }
} 