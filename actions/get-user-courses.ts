"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

/**
 * Fetches courses created by the current user
 */
export async function getUserCreatedCourses() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { courses: [], error: "Unauthorized" };
    }

    const courses = await db.course.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        category: true,
        chapters: {
          include: {
            sections: true
          }
        },
        enrollments: {
          select: {
            id: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Calculate the average rating for each course
    const coursesWithStats = courses.map(course => {
      const totalRatings = course.reviews.length;
      const averageRating = totalRatings > 0 
        ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / totalRatings 
        : 0;
      
      // Calculate completion percentage, total chapters, etc.
      const totalChapters = course.chapters.length;
      const totalSections = course.chapters.reduce((acc, chapter) => 
        acc + chapter.sections.length, 0);
      
      // Calculate total enrolled students
      const totalEnrolled = course.enrollments.length;
      
      return {
        ...course,
        totalRatings,
        averageRating,
        totalChapters,
        totalSections,
        totalEnrolled
      };
    });

    return { 
      courses: coursesWithStats,
      error: null
    };
  } catch (error) {
    console.error("[GET_CREATED_COURSES_ERROR]", error);
    return { 
      courses: [], 
      error: "Failed to fetch created courses" 
    };
  }
}

/**
 * Fetches courses the current user is enrolled in
 */
export async function getUserEnrolledCourses() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { courses: [], error: "Unauthorized" };
    }

    const enrollments = await db.enrollment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        course: {
          include: {
            category: true,
            chapters: {
              include: {
                sections: true,
                userProgress: {
                  where: {
                    userId: session.user.id
                  }
                }
              }
            },
            reviews: {
              select: {
                rating: true
              }
            },
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Process and calculate stats for each enrolled course
    const enrolledCourses = enrollments.map(enrollment => {
      const course = enrollment.course;
      
      // Calculate the average rating
      const totalRatings = course.reviews.length;
      const averageRating = totalRatings > 0 
        ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / totalRatings 
        : 0;
      
      // Calculate completion stats
      const totalChapters = course.chapters.length;
      const totalSections = course.chapters.reduce((acc, chapter) => 
        acc + chapter.sections.length, 0);
      
      // Count completed sections
      const completedSections = course.chapters.reduce((acc, chapter) => {
        return acc + chapter.userProgress.filter(progress => progress.isCompleted).length;
      }, 0);
      
      // Calculate completion percentage
      const completionPercentage = totalSections > 0 
        ? Math.round((completedSections / totalSections) * 100) 
        : 0;
      
      return {
        ...course,
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.createdAt,
        totalRatings,
        averageRating,
        totalChapters,
        totalSections,
        completedSections,
        completionPercentage,
        instructor: course.user
      };
    });

    return { 
      courses: enrolledCourses,
      error: null 
    };
  } catch (error) {
    console.error("[GET_ENROLLED_COURSES_ERROR]", error);
    return { 
      courses: [], 
      error: "Failed to fetch enrolled courses" 
    };
  }
} 