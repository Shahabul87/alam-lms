import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Near the top of the file, add a helper function for safer error responses
const createErrorResponse = (message: string, status = 500) => {
  console.error(`[REACTIONS_POST] Error: ${message}`);
  return NextResponse.json(
    { error: message },
    { status }
  );
};

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    // At the start of the POST function, add a try/catch for the session check
    try {
      const user = await currentUser();
      if (!user) {
        return createErrorResponse("Unauthorized", 401);
      }
    } catch (sessionError) {
      console.error("[REACTIONS_POST] Session Error:", sessionError);
      return createErrorResponse("Authentication error. Please sign in again.", 401);
    }

    // Get the reaction type from the request body
    const body = await request.json();
    const { type } = body;

    // Add validation for request body
    if (!type || typeof type !== 'string') {
      return createErrorResponse("Invalid reaction type", 400);
    }

    // Get the params and extract commentId and postId
    const params = await props.params;
    const { commentId, postId } = params;

    // Validate IDs
    if (!postId || typeof postId !== 'string') {
      return createErrorResponse("Invalid post ID", 400);
    }
    
    if (!commentId || typeof commentId !== 'string') {
      return createErrorResponse("Invalid comment ID", 400);
    }

    console.log("[REACTIONS_POST] Searching for comment:", { commentId, postId });

    // First verify the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      console.log("[REACTIONS_POST] Post not found:", postId);
      return createErrorResponse("Post not found", 404);
    }

    // Verify the comment exists and belongs to the post
    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        postId: postId,
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

    if (!comment) {
      console.log("[REACTIONS_POST] Comment not found:", { commentId, postId });
      // Let's check if the comment exists at all, regardless of postId
      const commentExists = await db.comment.findUnique({
        where: { id: commentId },
        select: { id: true, postId: true }
      });
      
      if (commentExists) {
        console.log("[REACTIONS_POST] Comment exists but with different postId:", commentExists);
      }
      
      return createErrorResponse("Comment not found", 404);
    }

    console.log("[REACTIONS_POST] Found comment:", { 
      commentId: comment.id,
      postId: comment.postId,
      reactionCount: comment.reactions.length 
    });

    // Handle the reaction in a transaction
    const result = await db.$transaction(async (tx) => {
      // Check for existing reaction
      const existingReaction = await tx.reaction.findFirst({
        where: {
          userId: user.id,
          commentId: commentId,
          type: type,
        },
      });

      if (existingReaction) {
        console.log("[REACTIONS_POST] Removing existing reaction:", existingReaction.id);
        // Remove existing reaction
        await tx.reaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
      } else {
        console.log("[REACTIONS_POST] Creating new reaction");
        // Create new reaction
        await tx.reaction.create({
          data: {
            type,
            userId: user.id,
            commentId,
          },
        });
      }

      // Get updated comment with reactions
      const updatedComment = await tx.comment.findUnique({
        where: {
          id: commentId,
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
          replies: {
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
          },
        },
      });

      return updatedComment;
    });

    console.log("[REACTIONS_POST] Successfully processed reaction");
    return NextResponse.json(result);
  } catch (error) {
    // Improve error logging
    console.error("[REACTIONS_POST] Unexpected error:", error);
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("database") || error.message.includes("prisma")) {
        return createErrorResponse("Database error. Please try again later.", 500);
      }
    }
    
    return createErrorResponse("Internal server error", 500);
  }
} 