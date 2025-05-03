import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileData } from "@/app/actions/get-profile-data";
import { getActivityData } from "@/app/actions/get-activity-data";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import OverviewCards from "@/components/dashboard/overview-cards";
import RecentActivities from "@/components/dashboard/recent-activities";
import EnrolledCourses from "@/components/dashboard/enrolled-courses";
import UserProfileSummary from "@/components/dashboard/user-profile-summary";
import QuickLinks from "@/components/dashboard/quick-links";
import PerformanceStats from "@/components/dashboard/performance-stats";

export default async function UserDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  const userData = await getProfileData();
  const activities = await getActivityData();
  
  // Format dates to strings for the activities
  const formattedActivities = activities ? activities.map(activity => ({
    ...activity,
    createdAt: activity.createdAt.toISOString()
  })) : [];
  
  if (!userData) {
    redirect("/auth/login");
  }
  
  return (
    <div className="min-h-screen ">
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <DashboardHeader user={session.user} />

        {/* Overview Cards */}
        <OverviewCards userData={userData} />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activities */}
            <RecentActivities activities={formattedActivities} />

            {/* Enrolled Courses */}
            <EnrolledCourses courses={userData.courses || []} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Summary */}
            <UserProfileSummary user={session.user} userData={userData} />

            {/* Quick Links */}
            <QuickLinks 
              favoriteVideos={userData.favoriteVideos || []} 
              favoriteAudios={userData.favoriteAudios || []}
              favoriteBlogs={userData.favoriteBlogs || []}
              favoriteArticles={userData.favoriteArticles || []}
            />

            {/* Performance Summary */}
            <PerformanceStats />
          </div>
        </div>
      </main>
    </div>
  );
}