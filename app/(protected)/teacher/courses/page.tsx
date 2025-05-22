import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CoursesDashboard } from "./_components/courses-dashboard";
import { cn } from "@/lib/utils";

const CoursesPage = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/");
  }

  const courses = await db.course.findMany({
    where: {
      userId: user?.id || '',
    },
    select: {
      id: true,
      title: true,
      category: {
        select: {
          name: true
        }
      },
      price: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get course stats
  const publishedCount = courses.filter(course => course.isPublished).length;
  const draftCount = courses.length - publishedCount;

  return (
    <div className={cn(
      "min-h-screen",
      "bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800",
      "transition-colors duration-300"
    )}>
      <div className={cn(
        "container mx-auto",
        "px-4 sm:px-6 lg:px-8",
        "py-6 sm:py-8 lg:py-12",
        "max-w-[2000px]"
      )}>
        <CoursesDashboard 
          courses={courses}
          stats={{
            total: courses.length,
            published: publishedCount,
            draft: draftCount
          }}
        />
      </div>
    </div>
  );
};

export default CoursesPage;