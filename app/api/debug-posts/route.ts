import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log("🔍 DEBUG API: Checking database posts...");

    // Get total count
    const totalCount = await db.post.count();
    console.log(`📊 Total posts: ${totalCount}`);

    // Get all posts with basic info
    const allPosts = await db.post.findMany({
      select: {
        id: true,
        title: true,
        published: true,
        category: true,
        createdAt: true,
        userId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Count by status
    const publishedTrue = allPosts.filter(p => p.published === true).length;
    const publishedFalse = allPosts.filter(p => p.published === false).length;
    const publishedNull = allPosts.filter(p => p.published === null).length;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total: totalCount,
        published: publishedTrue,
        unpublished: publishedFalse,
        nullPublished: publishedNull,
      },
      posts: allPosts.map(post => ({
        id: post.id,
        title: post.title.substring(0, 50) + (post.title.length > 50 ? "..." : ""),
        published: post.published,
        category: post.category,
        createdAt: post.createdAt,
        userId: post.userId,
      })),
    };

    console.log("✅ DEBUG API: Response prepared:", response.summary);
    return NextResponse.json(response);

  } catch (error) {
    console.error("💥 DEBUG API: Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 