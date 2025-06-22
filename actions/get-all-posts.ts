import { Post } from "@prisma/client";
import { db } from "@/lib/db";

type PostForHomepage = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  published: boolean;
  category: string | null;
  createdAt: string;
  comments: any[];
  userId: string;
  updatedAt: Date;
  user?: {
    name: string | null;
  };
  views?: number;
};

type GetPosts = {
  title?: string;
  category?: string;
};

export const getPostsForHomepage = async (): Promise<PostForHomepage[]> => {
  console.log("🚀 [GET_POSTS] Starting to fetch posts for homepage...");
  
  try {
    // First, let's check if database connection is working
    console.log("🔗 [GET_POSTS] Testing database connection...");
    
    // Check total posts count first
    const totalPostsCount = await db.post.count();
    console.log(`📊 [GET_POSTS] Total posts in database: ${totalPostsCount}`);
    
    if (totalPostsCount === 0) {
      console.log("⚠️ [GET_POSTS] No posts found in database at all!");
      return [];
    }

    // Check published posts count
    const publishedCount = await db.post.count({
      where: { published: true }
    });
    console.log(`✅ [GET_POSTS] Published posts count: ${publishedCount}`);

    // Check null published count
    const nullPublishedCount = await db.post.count({
      where: { published: null }
    });
    console.log(`❓ [GET_POSTS] Null published posts count: ${nullPublishedCount}`);

    // Check false published count
    const falsePublishedCount = await db.post.count({
      where: { published: false }
    });
    console.log(`❌ [GET_POSTS] Unpublished posts count: ${falsePublishedCount}`);

    // Get a sample of all posts to see their status
    const samplePosts = await db.post.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        published: true,
        category: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log("📝 [GET_POSTS] Sample posts from database:", samplePosts);

    // Now fetch published posts (including null as published)
    console.log("🔍 [GET_POSTS] Fetching published posts (including null)...");
    const posts = await db.post.findMany({
      where: {
        OR: [
          { published: true },
          { published: null }
        ]
      },
      include: {
        comments: {
          select: {
            id: true,
          }
        },
        user: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ [GET_POSTS] Successfully fetched ${posts.length} posts (published: true or null)`);
    
    if (posts.length === 0) {
      console.log("⚠️ [GET_POSTS] No posts found with published: true or null");
    }

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      published: post.published === true || post.published === null, // Treat null as published
      category: post.category,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt,
      userId: post.userId,
      comments: post.comments,
      user: post.user,
      views: Math.floor(Math.random() * 1000) + 1,
    }));

    console.log("🎉 [GET_POSTS] Successfully formatted posts. Sample:", formattedPosts.slice(0, 2));
    console.log(`✅ [GET_POSTS] Returning ${formattedPosts.length} formatted posts`);
    
    return formattedPosts;
  } catch (error) {
    console.error("💥 [GET_POSTS] CRITICAL ERROR fetching posts:");
    console.error("Error details:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};

export const getPostsByCategory = async (category: string): Promise<PostForHomepage[]> => {
  try {
    console.log(`[GET_POSTS_BY_CATEGORY] Fetching posts for category: ${category}`);
    
    const posts = await db.post.findMany({
      where: {
        published: true,
        category: category,
      },
      include: {
        comments: {
          select: {
            id: true,
          }
        },
        user: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[GET_POSTS_BY_CATEGORY] Found ${posts.length} posts for category ${category}`);

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      published: post.published,
      category: post.category,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt,
      userId: post.userId,
      comments: post.comments,
      user: post.user,
      views: Math.floor(Math.random() * 1000) + 1,
    }));
  } catch (error) {
    console.error("[GET_POSTS_BY_CATEGORY] Error:", error);
    return [];
  }
};

