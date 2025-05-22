import { db } from "@/lib/db";

export const getPostData = async (postId: string) => {
  try {
    console.log("Fetching post data for:", postId);
    
    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
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
          orderBy: {
            createdAt: "asc",
          },
        },
        tags: true,
        postchapter: {
          orderBy: {
            position: "asc",
          },
        },
        postimage: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!post) {
      console.log("Post not found:", postId);
      return null;
    }

    console.log("Post data loaded:", {
      id: post.id,
      commentCount: post.comments.length,
      hasComments: post.comments.length > 0,
      firstCommentId: post.comments[0]?.id
    });

    return post;
  } catch (error) {
    console.error("[GET_POST_DATA]", error);
    return null;
  }
}; 