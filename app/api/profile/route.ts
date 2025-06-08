import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();
    console.log("[PROFILE_PATCH] Request body values:", values);

    const updateData: any = {};
    
    if (values.name !== undefined) updateData.name = values.name;
    if (values.image !== undefined) updateData.image = values.image;
    if (values.phone !== undefined) updateData.phone = values.phone;

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        createdAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("[PROFILE_GET] Starting profile fetch...");
    const session = await auth();
    console.log("[PROFILE_GET] Session:", { userId: session?.user?.id, email: session?.user?.email });

    if (!session?.user?.id) {
      console.log("[PROFILE_GET] No user session found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("[PROFILE_GET] Fetching user data for ID:", session.user.id);

    // First, try to get basic user data
    const userData = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        createdAt: true
      }
    });

    if (!userData) {
      console.log("[PROFILE_GET] User not found in database");
      return new NextResponse("User not found", { status: 404 });
    }

    console.log("[PROFILE_GET] Basic user data found:", userData);

    // Try to get counts safely
    let stats = {
      followers: 0,
      following: 0,
      likes: 0,
      posts: 0,
      comments: 0,
      subscriptions: 0,
      monthlySpending: 0,
      content: 0,
      ideas: 0,
      courses: 0
    };

    try {
      const counts = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          _count: {
            select: {
              posts: true,
              comments: true,
              replies: true,
              reactions: true,
              videos: true,
              blogs: true,
              articles: true,
              ideas: true,
              courses: true
            }
          }
        }
      });

      if (counts) {
        stats = {
          followers: 0, // Will be calculated from social media accounts later
          following: 0, // Will be calculated from social media accounts later
          likes: counts._count.reactions,
          posts: counts._count.posts,
          comments: counts._count.comments,
          subscriptions: 0, // Will be calculated from user subscriptions later
          monthlySpending: 0, // Will be calculated from user subscriptions later
          content: counts._count.videos + counts._count.blogs + counts._count.articles,
          ideas: counts._count.ideas,
          courses: counts._count.courses
        };
      }
    } catch (countError) {
      console.warn("[PROFILE_GET] Error calculating counts, using defaults:", countError);
    }

    // Try to get social media accounts safely
    let socialMediaAccounts: any[] = [];
    try {
      socialMediaAccounts = await db.socialMediaAccount.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          platform: true,
          username: true,
          displayName: true,
          followerCount: true,
          followingCount: true,
          postsCount: true,
          isActive: true,
          lastSyncAt: true
        }
      });

      // Update follower/following counts from social media
      const totalFollowers = socialMediaAccounts.reduce((total, account) => {
        return total + (account.followerCount || 0);
      }, 0);

      const totalFollowing = socialMediaAccounts.reduce((total, account) => {
        return total + (account.followingCount || 0);
      }, 0);

      stats.followers = totalFollowers;
      stats.following = totalFollowing;

    } catch (socialError) {
      console.warn("[PROFILE_GET] Error fetching social media accounts:", socialError);
    }

    // Try to get subscriptions safely
    let userSubscriptions: any[] = [];
    try {
      userSubscriptions = await db.userSubscription.findMany({
        where: { 
          userId: session.user.id,
          isActive: true
        },
        select: {
          id: true,
          serviceName: true,
          cost: true,
          currency: true,
          billingCycle: true,
          nextBillingDate: true
        }
      });

      // Calculate monthly spending
      const monthlySpending = userSubscriptions.reduce((total, sub) => {
        if (sub.billingCycle === 'MONTHLY') {
          return total + sub.cost;
        } else if (sub.billingCycle === 'YEARLY') {
          return total + (sub.cost / 12);
        }
        return total;
      }, 0);

      stats.subscriptions = userSubscriptions.length;
      stats.monthlySpending = monthlySpending;

    } catch (subscriptionError) {
      console.warn("[PROFILE_GET] Error fetching subscriptions:", subscriptionError);
    }

    const enhancedUserData = {
      ...userData,
      stats,
      socialMediaAccounts,
      userSubscriptions,
      profileLinks: [] // Empty for now, will add later if needed
    };

    console.log("[PROFILE_GET] Returning enhanced user data:", enhancedUserData);
    return NextResponse.json(enhancedUserData);

  } catch (error) {
    console.error("[PROFILE_GET] Unexpected error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 