import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSmartDashboardData } from "@/app/actions/get-smart-dashboard-data";
import SmartDashboardTabs from "@/components/dashboard/smart/smart-dashboard-tabs";

export default async function SmartUserDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  // Fetch comprehensive dashboard data
  const dashboardData = await getSmartDashboardData();
  
  if (!dashboardData) {
    redirect("/auth/login");
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section - Always Visible */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {session.user.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening with your learning journey today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-orange-500">7 days 🔥</p>
              </div>
          </div>
          </div>
        </div>

        {/* Tab-based Dashboard */}
        <SmartDashboardTabs 
          user={session.user}
          dashboardData={dashboardData}
        />
      </div>
    </div>
  );
}