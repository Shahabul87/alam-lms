import { db } from "@/lib/db";
import { auth } from "@/auth";
import { ActivityItem, ActivityStatus, ActivityType } from "../profile/_components/activity-dashboard/types";

/**
 * Get real user activities from the database
 */
export const getActivityData = async () => {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return null;
    }
    
    const userId = session.user.id;
    
    // Try to fetch real activities from database
    try {
      const activities = await fetchRealActivities(userId);
      return activities;
    } catch (error) {
      console.warn("Activity table not available, returning empty array:", error);
      return [];
    }
    
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return [];
  }
};

/**
 * Fetch real activities from database
 */
const fetchRealActivities = async (userId: string): Promise<ActivityItem[]> => {
  // Try to fetch from an activities table if it exists
  try {
    const activities = await db.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    return activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description || "",
      type: activity.type as ActivityType,
      status: activity.status as ActivityStatus,
      priority: activity.priority || "medium",
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      dueDate: activity.dueDate,
      completedDate: activity.completedDate,
      progress: activity.progress || 0,
      userId: activity.userId
    }));
  } catch (error) {
    // If Activity table doesn't exist, try to get activities from other sources
    const userActivities = await getActivitiesFromUserData(userId);
    return userActivities;
  }
};

/**
 * Get activities from user's existing data (posts, ideas, courses, etc.)
 */
const getActivitiesFromUserData = async (userId: string): Promise<ActivityItem[]> => {
  const activities: ActivityItem[] = [];
  
  try {
    // Get user data
    const userData = await db.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        ideas: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        courses: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        profileLinks: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        socialMediaAccounts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!userData) return [];

    // Convert posts to activities
    userData.posts.forEach(post => {
      activities.push({
        id: `post_${post.id}`,
        title: `Blog Post: ${post.title}`,
        description: post.content ? post.content.substring(0, 100) + "..." : "Blog post content",
        type: "script" as ActivityType,
        status: "completed" as ActivityStatus,
        priority: "medium",
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        completedDate: post.publishedAt || post.createdAt,
        progress: 100,
        userId
      });
    });

    // Convert ideas to activities
    userData.ideas.forEach(idea => {
      activities.push({
        id: `idea_${idea.id}`,
        title: `Idea: ${idea.title}`,
        description: idea.description || "New idea to explore",
        type: "idea" as ActivityType,
        status: idea.status === 'PUBLISHED' ? "completed" : "in-progress" as ActivityStatus,
        priority: "medium",
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
        completedDate: idea.status === 'PUBLISHED' ? idea.updatedAt : null,
        progress: idea.status === 'PUBLISHED' ? 100 : 30,
        userId
      });
    });

    // Convert courses to activities
    userData.courses.forEach(course => {
      activities.push({
        id: `course_${course.id}`,
        title: `Course: ${course.title}`,
        description: course.description || "Course content",
        type: "plan" as ActivityType,
        status: course.isPublished ? "completed" : "in-progress" as ActivityStatus,
        priority: "high",
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        completedDate: course.isPublished ? course.updatedAt : null,
        progress: course.isPublished ? 100 : 60,
        userId
      });
    });

    // Convert profile links to activities
    userData.profileLinks.forEach(link => {
      activities.push({
        id: `profile_${link.id}`,
        title: `Connected: ${link.platform}`,
        description: `Added profile link for ${link.platform}`,
        type: "subscription" as ActivityType,
        status: "completed" as ActivityStatus,
        priority: "low",
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        completedDate: link.createdAt,
        progress: 100,
        userId
      });
    });

    // Convert social media accounts to activities
    userData.socialMediaAccounts.forEach(account => {
      activities.push({
        id: `social_${account.id}`,
        title: `Connected: ${account.platform}`,
        description: `Connected ${account.platform} account (@${account.username})`,
        type: "subscription" as ActivityType,
        status: account.isActive ? "completed" : "in-progress" as ActivityStatus,
        priority: "medium",
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        completedDate: account.isActive ? account.createdAt : null,
        progress: account.isActive ? 100 : 50,
        userId
      });
    });

    // Sort by most recent first
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return activities;
    
  } catch (error) {
    console.error("Error getting activities from user data:", error);
    return [];
  }
}; 