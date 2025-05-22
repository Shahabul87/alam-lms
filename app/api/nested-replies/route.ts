import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isRateLimited, getRateLimitMessage } from "@/app/lib/rate-limit";

/**
 * Universal endpoint for nested replies at any depth.
 * This is a fallback API that provides the same functionality as create-nested-reply.
 */
export async function POST(req: NextRequest) {
  console.log("[NESTED_REPLIES] Request received");
  
  try {
    // Authenticate the user
    const user = await currentUser();
    if (!user) {
      console.log("[NESTED_REPLIES] Unauthorized - no user session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limiting
    const rateLimitResult = await isRateLimited(user.id, 'reply');
    if (rateLimitResult.limited) {
      console.log(`[NESTED_REPLIES] Rate limited: ${user.id}`, rateLimitResult);
      return NextResponse.json({ 
        error: getRateLimitMessage('reply', rateLimitResult.reset),
        rateLimitInfo: rateLimitResult
      }, { status: 429 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("[NESTED_REPLIES] Request body:", body);
    } catch (err) {
      console.error("[NESTED_REPLIES] Error parsing request:", err);
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const { postId, commentId, parentReplyId, content } = body;
    
    console.log("[NESTED_REPLIES] Processing request:", {
      postId,
      commentId,
      parentReplyId,
      contentLength: content?.length
    });

    // Validate required fields
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }
    
    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }

    // First verify the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      console.log("[NESTED_REPLIES] Post not found:", { postId });
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify the comment exists and belongs to the post
    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        postId,
      },
      select: { id: true }
    });

    if (!comment) {
      console.log("[NESTED_REPLIES] Comment not found:", { commentId, postId });
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Handle depth and path generation
    let depth = 0;
    let path = `${commentId}`;
    
    // If this is a reply to another reply, get the parent info
    if (parentReplyId) {
      const parentReply = await db.reply.findFirst({
        where: {
          id: parentReplyId,
          commentId,
          postId,
        },
        select: { 
          id: true,
          depth: true,
          path: true,
          commentId: true
        }
      });
      
      if (!parentReply) {
        console.log("[NESTED_REPLIES] Parent reply not found:", { parentReplyId, commentId, postId });
        return NextResponse.json({ error: "Parent reply not found" }, { status: 404 });
      }
      
      // Set depth and path based on parent
      depth = (parentReply.depth || 0) + 1;
      path = parentReply.path ? `${parentReply.path}/${parentReplyId}` : `${commentId}/${parentReplyId}`;
    }

    // Create the nested reply with depth and path info
    const reply = await db.reply.create({
      data: {
        content,
        userId: user.id,
        postId,
        commentId,
        parentReplyId: parentReplyId || null,
        depth,
        path,
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

    console.log("[NESTED_REPLIES] Reply created successfully:", { 
      replyId: reply.id,
      depth,
      path
    });
    
    return NextResponse.json(reply);
  } catch (error) {
    console.error("[NESTED_REPLIES] Error:", error);
    return NextResponse.json(
      { error: "Error creating reply" },
      { status: 500 }
    );
  }
} 