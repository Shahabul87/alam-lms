import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSmartDashboardData } from "@/app/actions/get-smart-dashboard-data";
import SmartDashboardHeader from "@/components/dashboard/smart/smart-dashboard-header";
import AIInsightsPanel from "@/components/dashboard/smart/ai-insights-panel";
import SmartOverviewCards from "@/components/dashboard/smart/smart-overview-cards";
import LearningProgressHub from "@/components/dashboard/smart/learning-progress-hub";
import SmartActivityFeed from "@/components/dashboard/smart/smart-activity-feed";
import PersonalizedRecommendations from "@/components/dashboard/smart/personalized-recommendations";
import SkillGrowthTracker from "@/components/dashboard/smart/skill-growth-tracker";
import QuickActionsPanel from "@/components/dashboard/smart/quick-actions-panel";
import EnhancedProfileSummary from "@/components/dashboard/smart/enhanced-profile-summary";
import SmartGoalsTracker from "@/components/dashboard/smart/smart-goals-tracker";
import PerformanceAnalytics from "@/components/dashboard/smart/performance-analytics";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/10">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Smart Dashboard Header with AI Greeting */}
        <SmartDashboardHeader 
          user={session.user} 
          userData={dashboardData.userData}
          aiInsights={dashboardData.aiInsights}
        />

        {/* AI Insights Panel - Prominent placement for AI-era focus */}
        <AIInsightsPanel 
          insights={dashboardData.aiInsights}
          learningData={dashboardData.learningAnalytics}
          userId={session.user.id}
        />

        {/* Enhanced Overview Cards with Smart Metrics */}
        <SmartOverviewCards 
          userData={dashboardData.userData}
          analytics={dashboardData.userAnalytics}
          achievements={dashboardData.achievements}
        />

        {/* Main Dashboard Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column - Primary Content */}
          <div className="xl:col-span-8 space-y-6">
            {/* Learning Progress Hub */}
            <LearningProgressHub 
              courses={dashboardData.userData.courses || []}
              enrollments={dashboardData.enrollments}
              progress={dashboardData.learningProgress}
            />

            {/* Smart Activity Feed with AI Categorization */}
            <SmartActivityFeed 
              activities={dashboardData.activities}
              aiCategorization={dashboardData.aiCategorizedActivities}
            />

            {/* Personalized Recommendations */}
            <PersonalizedRecommendations 
              recommendations={dashboardData.recommendations}
              userPreferences={dashboardData.userData.preferences}
              learningStyle={dashboardData.learningStyle}
            />

            {/* Performance Analytics Dashboard */}
            <PerformanceAnalytics 
              analytics={dashboardData.performanceMetrics}
              trends={dashboardData.performanceTrends}
              benchmarks={dashboardData.benchmarks}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            {/* Enhanced Profile Summary */}
            <EnhancedProfileSummary 
              user={session.user}
              userData={dashboardData.userData}
              socialAccounts={dashboardData.userData.socialMediaAccounts}
              achievements={dashboardData.achievements}
            />

            {/* Quick Actions Panel */}
            <QuickActionsPanel 
              user={session.user}
              suggestions={dashboardData.quickActionSuggestions}
            />

            {/* Smart Goals Tracker */}
            <SmartGoalsTracker 
              goals={dashboardData.userData.goals || []}
              milestones={dashboardData.milestones}
              aiRecommendedGoals={dashboardData.aiRecommendedGoals}
            />

            {/* Skill Growth Tracker */}
            <SkillGrowthTracker 
              skills={dashboardData.skillData}
              growthMetrics={dashboardData.skillGrowthMetrics}
              industryBenchmarks={dashboardData.skillBenchmarks}
            />
          </div>
        </div>
      </main>
    </div>
  );
}