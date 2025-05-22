import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Ultra simple reply endpoint - just create a reply with whatever is provided
 * Last resort fallback for when other APIs fail
 */
export async function POST(req: NextRequest) {
  console.log("[SIMPLE_REPLY] Request received");
  
  try {
    // Authenticate the user
    const user = await currentUser();
    if (!user) {
      console.log("[SIMPLE_REPLY] Unauthorized - no user session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("[SIMPLE_REPLY] Request body:", body);
    } catch (err) {
      console.error("[SIMPLE_REPLY] Error parsing request:", err);
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const { postId, commentId, parentReplyId, content } = body;
    
    console.log("[SIMPLE_REPLY] Processing request:", {
      postId, 
      commentId,
      parentReplyId,
      contentLength: content?.length
    });

    // Only validate content and postId
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }
    
    // Determine the comment ID and depth
    let targetCommentId = commentId;
    let depth = 0;
    
    // If parentReplyId is given, try to look it up - but don't fail if not found
    if (parentReplyId) {
      try {
        // Try to get the parent reply info
        const parentReply = await db.reply.findUnique({
          where: { id: parentReplyId },
          select: { id: true, commentId: true, depth: true }
        });
        
        if (parentReply) {
          // We found it - use its commentId and increment its depth
          targetCommentId = parentReply.commentId;
          depth = (parentReply.depth || 0) + 1;
          console.log("[SIMPLE_REPLY] Found parent reply:", { 
            parentId: parentReply.id, 
            commentId: parentReply.commentId, 
            newDepth: depth
          });
        } else {
          console.log("[SIMPLE_REPLY] Warning: Parent reply not found, using provided commentId");
        }
      } catch (lookupError) {
        console.error("[SIMPLE_REPLY] Error looking up parent reply - ignoring:", lookupError);
        // Continue anyway - we'll use the provided commentId
      }
    }
    
    // Safety check - in case we still don't have a valid commentId
    if (!targetCommentId) {
      console.log("[SIMPLE_REPLY] No valid commentId available, using fallback ID");
      // Create a fallback comment ID - this should never happen, but just in case
      targetCommentId = "fallback-" + postId;
    }
    
    // ESSENTIAL: Verify the commentId exists in the database to avoid foreign key constraint errors
    try {
      // Check if this commentId actually exists
      const commentExists = await db.comment.findUnique({
        where: { id: targetCommentId },
        select: { id: true }
      });
      
      if (!commentExists) {
        console.log("[SIMPLE_REPLY] Target comment doesn't exist:", targetCommentId);
        
        // As a last resort, try to find ANY comment for this post
        const anyComment = await db.comment.findFirst({
          where: { postId },
          select: { id: true }
        });
        
        if (anyComment) {
          console.log("[SIMPLE_REPLY] Found fallback comment:", anyComment.id);
          targetCommentId = anyComment.id;
        } else {
          console.log("[SIMPLE_REPLY] No comments found for post - cannot create reply");
          return NextResponse.json({ 
            error: "Cannot create reply - no valid comment found" 
          }, { status: 404 });
        }
      }
    } catch (commentCheckError) {
      console.error("[SIMPLE_REPLY] Error checking comment existence:", commentCheckError);
      return NextResponse.json({ 
        error: "Error validating comment - cannot create reply" 
      }, { status: 500 });
    }
    
    // Create the reply with minimal required fields
    console.log("[SIMPLE_REPLY] Creating reply with:", {
      commentId: targetCommentId,
      parentReplyId,
      depth
    });
    
    const reply = await db.reply.create({
      data: {
        content,
        userId: user.id,
        postId,
        commentId: targetCommentId,
        parentReplyId: parentReplyId || null,
        depth
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    console.log("[SIMPLE_REPLY] Reply created successfully:", { replyId: reply.id });
    
    // Return the created reply
    return NextResponse.json({
      ...reply,
      reactions: [] // Add an empty reactions array to match other APIs
    });
  } catch (error) {
    console.error("[SIMPLE_REPLY] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating reply" },
      { status: 500 }
    );
  }
} 