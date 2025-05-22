import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// POST endpoint for adding a reply to an existing reply
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ postId: string; commentId: string; replyId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    const params = await props.params;
    const { postId, commentId, replyId } = params;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    console.log("[REPLY_TO_REPLY_POST]", { postId, commentId, replyId, content });

    // Check if the parent comment exists
    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        postId,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }

    // Check if the parent reply exists and belongs to the comment
    const parentReply = await db.reply.findFirst({
      where: {
        id: replyId,
        commentId,
        postId,
      },
    });

    if (!parentReply) {
      return NextResponse.json({ error: "Parent reply not found" }, { status: 404 });
    }

    // Create new reply with parentReplyId set
    const newReply = await db.reply.create({
      data: {
        content,
        userId: user.id,
        postId,
        commentId,
        parentReplyId: replyId, // Set the parent reply ID
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

    return NextResponse.json(newReply);
  } catch (error) {
    console.error("[REPLY_TO_REPLY_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 