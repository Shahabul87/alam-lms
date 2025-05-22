import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isRateLimited, getRateLimitMessage } from "@/app/lib/rate-limit";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limiting
    const rateLimitResult = await isRateLimited(user.id, 'reply');
    if (rateLimitResult.limited) {
      console.log(`[COMMENT_REPLY_POST] Rate limited: ${user.id}`, rateLimitResult);
      return NextResponse.json({ 
        error: getRateLimitMessage('reply', rateLimitResult.reset),
        rateLimitInfo: rateLimitResult
      }, { status: 429 });
    }

    const { content, parentReplyId } = await req.json();
    const params = await props.params;
    const { postId, commentId } = params;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    console.log("[COMMENT_REPLY_POST] Processing reply:", { 
      postId, 
      commentId, 
      parentReplyId: parentReplyId || "none", 
      userId: user.id 
    });

    // Check if comment exists
    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        postId,
      },
    });

    if (!comment) {
      console.log("[COMMENT_REPLY_POST] Comment not found:", { commentId, postId });
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // If parentReplyId is provided, ensure it exists and belongs to this comment
    if (parentReplyId) {
      const parentReply = await db.reply.findFirst({
        where: {
          id: parentReplyId,
          commentId,
        },
        include: {
          // Include parent reply info to validate nesting depth
          parentReply: {
            select: {
              id: true,
              parentReplyId: true
            }
          }
        }
      });

      if (!parentReply) {
        console.log("[COMMENT_REPLY_POST] Parent reply not found:", { parentReplyId, commentId });
        return NextResponse.json({ error: "Parent reply not found" }, { status: 404 });
      }

      // Check nesting depth to prevent excessive depth
      // This is a backup server-side check
      let replyDepth = 1; // Start at 1 for this reply
      let currentReply = parentReply;
      
      while (currentReply.parentReplyId) {
        replyDepth++;
        
        // If we've gone too deep, we need to get the referenced parent
        if (replyDepth > 10) { // Hard limit on server side for safety
          console.log("[COMMENT_REPLY_POST] Excessive nesting depth detected:", { depth: replyDepth, parentReplyId });
          return NextResponse.json({ 
            error: "Maximum reply nesting depth exceeded" 
          }, { status: 400 });
        }
        
        // Get the next parent in the chain
        if (currentReply.parentReply) {
          currentReply = currentReply.parentReply;
        } else {
          // If we can't follow the chain, break to prevent infinite loop
          break;
        }
      }
      
      console.log("[COMMENT_REPLY_POST] Reply depth:", { depth: replyDepth, parentReplyId });
    }

    // Create reply with optional parentReplyId
    const reply = await db.reply.create({
      data: {
        content,
        userId: user.id,
        postId,
        commentId,
        parentReplyId: parentReplyId || null, // Include parentReplyId if provided
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

    console.log("[COMMENT_REPLY_POST] Reply created successfully:", { replyId: reply.id });
    return NextResponse.json(reply);
  } catch (error) {
    console.error("[COMMENT_REPLY_POST] Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  props: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const params = await props.params;
    const { commentId } = params;

    const replies = await db.reply.findMany({
      where: {
        commentId,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(replies);
  } catch (error) {
    console.error("[REPLIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


