import { Course, Category } from "@prisma/client";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
};

// Function to strip HTML tags and get plain text
const extractTextFromHtml = (html: string | null): string => {
  if (!html) return '';
  
  // Remove HTML tags
  const text = html.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Decode HTML entities
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

export const getCoursesForHomepage = async () => {
  const user = await currentUser();

  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
      },
      include: {
        chapters: true,
        category: true,
        purchases: {
          where: {
            userId: user?.id
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ensure cleanDescription is populated for each course
    const processedCourses = courses.map(course => {
      // If cleanDescription is empty but description exists, extract it
      if (!course.cleanDescription && course.description) {
        return {
          ...course,
          cleanDescription: extractTextFromHtml(course.description)
        };
      }
      return course;
    });

    console.log("Courses processed:", processedCourses.map(course => ({ 
      id: course.id, 
      title: course.title, 
      cleanDescription: course.cleanDescription?.substring(0, 50)
    })));

    return processedCourses;
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return [];
  }
};

