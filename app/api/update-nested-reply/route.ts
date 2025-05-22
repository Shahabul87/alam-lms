import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  console.log("[UPDATE_NESTED_REPLY] Request received");
  
  try {
    // Get current user
    const user = await currentUser();
    if (!user) {
      console.log("[UPDATE_NESTED_REPLY] Unauthorized - no user session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("[UPDATE_NESTED_REPLY] Error parsing request:", err);
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    // Get URL parameters
    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');
    const commentId = url.searchParams.get('commentId');
    const replyId = url.searchParams.get('replyId');
    const { content } = body;
    
    console.log("[UPDATE_NESTED_REPLY] Request params:", { 
      postId, 
      commentId, 
      replyId, 
      contentLength: content?.length || 0,
      userId: user.id 
    });

    // Validate required fields
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }
    
    if (!replyId) {
      return NextResponse.json({ error: "Reply ID is required" }, { status: 400 });
    }

    // First verify the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      console.log("[UPDATE_NESTED_REPLY] Post not found");
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // First, try to find the reply with minimal constraints
    let reply = await db.reply.findFirst({
      where: {
        id: replyId,
        userId: user.id, // Must belong to current user
      },
    });

    if (!reply) {
      console.log("[UPDATE_NESTED_REPLY] Reply not found with basic query, trying without user constraint for debugging");
      
      // For debugging - check if reply exists at all
      const anyReply = await db.reply.findUnique({
        where: { id: replyId },
        select: { 
          id: true, 
          userId: true, 
          postId: true,
          commentId: true,
          parentReplyId: true
        }
      });
      
      if (!anyReply) {
        console.log("[UPDATE_NESTED_REPLY] Reply does not exist at all");
        return NextResponse.json({ error: "Reply not found" }, { status: 404 });
      }
      
      if (anyReply.userId !== user.id) {
        console.log("[UPDATE_NESTED_REPLY] Reply exists but belongs to different user", {
          replyOwner: anyReply.userId,
          currentUser: user.id
        });
        return NextResponse.json({ error: "You don't have permission to update this reply" }, { status: 403 });
      }
      
      console.log("[UPDATE_NESTED_REPLY] Reply exists but with different parameters:", anyReply);
      
      // If we get here, the reply exists but didn't match our query
      // Since we've verified user ownership, we can proceed with the update
      reply = anyReply;
    }

    // Update the reply
    const updatedReply = await db.reply.update({
      where: {
        id: replyId,
      },
      data: {
        content,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    console.log("[UPDATE_NESTED_REPLY] Reply updated successfully:", replyId);
    return NextResponse.json(updatedReply);
  } catch (error) {
    console.error("[UPDATE_NESTED_REPLY] Error:", error);
    return NextResponse.json(
      { error: "Error updating reply" },
      { status: 500 }
    );
  }
} 