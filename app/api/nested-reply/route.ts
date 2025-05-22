import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isRateLimited, getRateLimitMessage } from "@/app/lib/rate-limit";

/**
 * Additional fallback API for nested replies - different URL structure
 * This provides yet another way to create nested replies if the other endpoints fail
 */
export async function POST(req: NextRequest) {
  console.log("[NESTED_REPLY] Request received");
  
  try {
    // Authenticate the user
    const user = await currentUser();
    if (!user) {
      console.log("[NESTED_REPLY] Unauthorized - no user session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limiting
    const rateLimitResult = await isRateLimited(user.id, 'reply');
    if (rateLimitResult.limited) {
      console.log(`[NESTED_REPLY] Rate limited: ${user.id}`, rateLimitResult);
      return NextResponse.json({ 
        error: getRateLimitMessage('reply', rateLimitResult.reset),
        rateLimitInfo: rateLimitResult
      }, { status: 429 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("[NESTED_REPLY] Request body:", body);
    } catch (err) {
      console.error("[NESTED_REPLY] Error parsing request:", err);
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const { postId, commentId, parentReplyId, content } = body;
    
    console.log("[NESTED_REPLY] Processing request:", {
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

    // First verify the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      console.log("[NESTED_REPLY] Post not found:", { postId });
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // SIMPLIFIED APPROACH: We'll work with either commentId or parentReplyId
    let targetCommentId = commentId;
    let depth = 0;
    let path = "";
    
    // If this is a reply to another reply, get the parent info
    if (parentReplyId) {
      // Look up the parent reply by ID - relaxed query just using parentReplyId
      const parentReply = await db.reply.findUnique({
        where: { id: parentReplyId },
        select: { 
          id: true,
          commentId: true,
          depth: true,
          path: true
        }
      });
      
      if (!parentReply) {
        console.log("[NESTED_REPLY] Parent reply not found:", { parentReplyId });
        return NextResponse.json({ error: "Parent reply not found" }, { status: 404 });
      }
      
      // Use the parent's commentId if no comment ID was provided
      targetCommentId = targetCommentId || parentReply.commentId;
      
      // IMPORTANT: Verify that the commentId exists in the database
      if (targetCommentId) {
        const commentExists = await db.comment.findUnique({
          where: { id: targetCommentId },
          select: { id: true }
        });
        
        if (!commentExists) {
          console.log("[NESTED_REPLY] Target comment not found:", { targetCommentId });
          return NextResponse.json({ error: "Target comment not found" }, { status: 404 });
        }
      } else {
        console.log("[NESTED_REPLY] No valid comment ID found for reply");
        return NextResponse.json({ error: "Missing valid comment ID" }, { status: 400 });
      }
      
      // Set depth and path based on parent
      depth = (parentReply.depth || 0) + 1;
      
      // Generate path
      if (parentReply.path) {
        path = `${parentReply.path}/${parentReplyId}`;
      } else if (targetCommentId) {
        path = `${targetCommentId}/${parentReplyId}`;
      } else {
        // Fallback if we can't establish a proper path
        path = `reply/${parentReplyId}`;
      }
      
      console.log("[NESTED_REPLY] Using parent reply:", {
        parentReplyId,
        targetCommentId,
        depth,
        path
      });
    } else if (targetCommentId) {
      // Direct reply to a comment
      path = targetCommentId;
      
      // Verify the comment exists
      const comment = await db.comment.findUnique({
        where: { id: targetCommentId },
        select: { id: true }
      });
      
      if (!comment) {
        console.log("[NESTED_REPLY] Comment not found:", { targetCommentId });
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }
    } else {
      // We need either a comment ID or a parent reply ID
      console.log("[NESTED_REPLY] Missing both commentId and parentReplyId");
      return NextResponse.json({ error: "Either commentId or parentReplyId is required" }, { status: 400 });
    }

    console.log("[NESTED_REPLY] Creating reply with:", {
      targetCommentId,
      parentReplyId,
      depth,
      path
    });

    // Create the nested reply with depth and path info
    const reply = await db.reply.create({
      data: {
        content,
        userId: user.id,
        postId,
        commentId: targetCommentId,
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

    console.log("[NESTED_REPLY] Reply created successfully:", { 
      replyId: reply.id,
      depth,
      path
    });
    
    return NextResponse.json(reply);
  } catch (error) {
    console.error("[NESTED_REPLY] Error:", error);
    return NextResponse.json(
      { error: "Error creating reply" },
      { status: 500 }
    );
  }
} 