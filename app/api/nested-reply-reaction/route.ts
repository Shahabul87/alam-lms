import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// A simplified endpoint specifically for nested reply reactions
export async function POST(req: NextRequest) {
  console.log("[NESTED_REPLY_REACTION] Received request");
  
  try {
    // Authenticate the user
    const user = await currentUser();
    if (!user) {
      console.log("[NESTED_REPLY_REACTION] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("[NESTED_REPLY_REACTION] Request body:", body);
    } catch (err) {
      console.error("[NESTED_REPLY_REACTION] Error parsing request:", err);
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const { postId, replyId, type } = body;
    
    // Validate required fields
    if (!type) {
      return NextResponse.json({ error: "Reaction type is required" }, { status: 400 });
    }
    
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }
    
    if (!replyId) {
      return NextResponse.json({ error: "Reply ID is required" }, { status: 400 });
    }

    console.log("[NESTED_REPLY_REACTION] Processing reaction:", {
      postId,
      replyId,
      type,
      userId: user.id
    });

    // First, try to find the reply with just ID
    let reply = await db.reply.findUnique({
      where: {
        id: replyId,
      },
    });

    if (!reply) {
      console.log("[NESTED_REPLY_REACTION] Reply not found");
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    // Debug info
    console.log("[NESTED_REPLY_REACTION] Found reply:", {
      id: reply.id,
      postId: reply.postId,
      commentId: reply.commentId,
      parentReplyId: reply.parentReplyId
    });

    // Process the reaction in a transaction
    const result = await db.$transaction(async (tx) => {
      // Check for existing reaction
      const existingReaction = await tx.reaction.findFirst({
        where: {
          userId: user.id,
          replyId,
          type,
        },
      });

      if (existingReaction) {
        // Remove existing reaction (toggle off)
        console.log("[NESTED_REPLY_REACTION] Removing existing reaction:", existingReaction.id);
        await tx.reaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
      } else {
        // Remove any existing reactions by this user on this reply
        const deleted = await tx.reaction.deleteMany({
          where: {
            userId: user.id,
            replyId,
          },
        });
        console.log("[NESTED_REPLY_REACTION] Removed previous reactions:", deleted.count);

        // Create new reaction
        const newReaction = await tx.reaction.create({
          data: {
            type,
            userId: user.id,
            replyId,
          },
        });
        console.log("[NESTED_REPLY_REACTION] Created new reaction:", newReaction.id);
      }

      // Get updated reply with reactions
      const updatedReply = await tx.reply.findUnique({
        where: {
          id: replyId,
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

      return updatedReply;
    });

    console.log("[NESTED_REPLY_REACTION] Successfully processed reply reaction with reaction count:", result?.reactions?.length || 0);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[NESTED_REPLY_REACTION] Error:", error);
    return NextResponse.json(
      { error: "Error processing reaction" },
      { status: 500 }
    );
  }
} 