import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserCreatedCourses, getUserEnrolledCourses } from "@/actions/get-user-courses";

import { MyCoursesDashboard } from "./_components/my-courses-dashboard";

export const dynamic = "force-dynamic";

const MyCoursesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/auth/login");
  }

  // Fetch both types of courses simultaneously
  const [enrolledCoursesData, createdCoursesData] = await Promise.all([
    getUserEnrolledCourses(),
    getUserCreatedCourses(),
  ]);

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <MyCoursesDashboard 
        enrolledCourses={enrolledCoursesData.courses}
        createdCourses={createdCoursesData.courses}
        enrolledCoursesError={enrolledCoursesData.error}
        createdCoursesError={createdCoursesData.error}
      />
    </div>
  );
};

export default MyCoursesPage; 