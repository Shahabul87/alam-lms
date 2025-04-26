import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  BarChart,
  Calendar,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { auth } from "@/auth";
import { currentUser } from '@/lib/auth'
import { SidebarDemo } from "@/components/ui/sidebar-demo";
import ConditionalHeader from "@/app/(homepage)/user-header";
import { Suspense } from "react";
import { getAdminDashboardData } from "@/actions/admin";
import { UserRole } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

// Dashboard components
import { AdminDashboardSkeleton } from "@/components/skeletons/admin-dashboard-skeleton";
import { 
  UsersIcon, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  MessageSquare, 
  ArrowUpRight,
  LucideIcon
} from "lucide-react";

// Client components for charts (these are 'use client' components)
import { 
  ClientLineChart, 
  ClientBarChart, 
  ClientPieChart,
  ClientAreaChart
} from "@/components/charts/client-charts";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the learning platform",
};

interface AnalyticCard {
  title: string;
  value: string;
  description: string;
  icon: any;
  trend: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastActive: Date;
  coursesEnrolled: number;
}

interface RecentCourse {
  id: string;
  title: string;
  instructor: string;
  enrollments: number;
  revenue: number;
  rating: number;
}

async function getAnalytics() {
  // In real app, fetch from your API
  const analytics: AnalyticCard[] = [
    {
      title: "Total Revenue",
      value: "$12,345",
      description: "Monthly revenue",
      icon: DollarSign,
      trend: 12.5,
    },
    {
      title: "Active Users",
      value: "1,234",
      description: "Monthly active users",
      icon: Users,
      trend: 8.2,
    },
    {
      title: "Course Enrollments",
      value: "456",
      description: "New enrollments this month",
      icon: BookOpen,
      trend: -3.4,
    },
    {
      title: "Completion Rate",
      value: "78%",
      description: "Average course completion",
      icon: Activity,
      trend: 5.1,
    },
  ];
  return analytics;
}

async function getRecentUsers() {
  // In real app, fetch from your API
  const users: RecentUser[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "/avatars/1.png",
      lastActive: new Date(),
      coursesEnrolled: 3,
    },
    // Add more users...
  ];
  return users;
}

async function getRecentCourses() {
  // In real app, fetch from your API
  const courses: RecentCourse[] = [
    {
      id: "1",
      title: "Advanced Web Development",
      instructor: "Jane Smith",
      enrollments: 156,
      revenue: 7890,
      rating: 4.8,
    },
    // Add more courses...
  ];
  return courses;
}

async function AdminDashboard() {
  const data = await getAdminDashboardData();
  
  const {
    usersStats,
    authProviders,
    userGrowth,
    recentUsers,
    additionalStats
  } = data;
  
  // Format data for charts
  const authProvidersData = [
    { name: "Email/Password", value: usersStats.totalUsers - authProviders.reduce((sum, p) => sum + p._count.provider, 0) },
    ...authProviders.map(p => ({ name: p.provider, value: p._count.provider }))
  ];
  
  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f472b6', '#f59e0b'];
  
  const formatUserGrowth = userGrowth.map(entry => ({
    month: `${entry.month}/${entry.year}`,
    users: entry.count
  }));
  
  // Stats cards data
  const statsCards = [
    {
      title: "Total Users",
      value: usersStats.totalUsers.toString(),
      icon: UsersIcon,
      color: "bg-blue-500",
      change: "+12%",
      positive: true
    },
    {
      title: "Verified Users",
      value: `${Math.round(usersStats.verificationRate)}%`,
      icon: CheckCircle,
      color: "bg-green-500",
      change: "+5%",
      positive: true
    },
    {
      title: "Weekly Growth",
      value: `${Math.round(usersStats.weeklyGrowthRate)}%`,
      icon: BarChart3,
      color: "bg-purple-500",
      change: "+8%",
      positive: true
    },
    {
      title: "Monthly Growth",
      value: `${Math.round(usersStats.monthlyGrowthRate)}%`,
      icon: Calendar,
      color: "bg-amber-500",
      change: "-3%",
      positive: false
    }
  ];
  
  // Additional stats data
  const additionalStatsCards = [
    {
      title: "Total Courses",
      value: additionalStats.totalCourses.toString(),
      icon: BookOpen,
      color: "bg-indigo-500"
    },
    {
      title: "Total Groups",
      value: additionalStats.totalGroups.toString(),
      icon: Users,
      color: "bg-pink-500"
    },
    {
      title: "Total Resources",
      value: additionalStats.totalResources.toString(),
      icon: BarChart3,
      color: "bg-teal-500"
    },
    {
      title: "Total Messages",
      value: additionalStats.totalMessages.toString(),
      icon: MessageSquare,
      color: "bg-orange-500"
    }
  ];
  
  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform's statistics and performance.
        </p>
      </div>
      
      {/* Main stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-11">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">User Growth</h3>
              <div className="h-[300px]">
                <ClientAreaChart 
                  data={formatUserGrowth} 
                  xDataKey="month" 
                  areaDataKey="users" 
                  color="#8b5cf6"
                />
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Authentication Methods</h3>
              <div className="h-[300px]">
                <ClientPieChart 
                  data={authProvidersData} 
                  colors={COLORS} 
                />
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {additionalStatsCards.map((stat, i) => (
              <AdditionalStatsCard key={i} {...stat} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Recent Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">User</th>
                    <th className="text-left py-3 font-medium">Email</th>
                    <th className="text-left py-3 font-medium">Role</th>
                    <th className="text-left py-3 font-medium">Verified</th>
                    <th className="text-left py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-md text-xs ${
                          user.role === UserRole.ADMIN ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {user.emailVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </td>
                      <td className="py-3">{user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "Unknown"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Users by Verification Status</h3>
              <div className="h-[300px]">
                <ClientPieChart
                  data={[
                    { name: "Verified", value: usersStats.verifiedUsers },
                    { name: "Unverified", value: usersStats.unverifiedUsers }
                  ]}
                  colors={["#10b981", "#ef4444"]}
                />
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Weekly Registration Trend</h3>
              <div className="h-[300px]">
                <ClientBarChart
                  data={[
                    { name: "Past Month", users: usersStats.lastMonthUsers },
                    { name: "Past Week", users: usersStats.lastWeekUsers }
                  ]}
                  xDataKey="name"
                  barDataKey="users"
                  color="#3b82f6"
                />
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-medium">Total Courses</h3>
                <p className="text-3xl font-bold mt-2">{additionalStats.totalCourses}</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  Growth compared to last month
                </div>
                <div className="flex items-center gap-1 text-sm mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+12%</span>
                </div>
              </div>
              <div className="absolute right-2 top-2 p-2 rounded-full bg-indigo-100">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-200 rounded-tl-full opacity-50"></div>
            </Card>
            
            <Card className="p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-medium">Total Groups</h3>
                <p className="text-3xl font-bold mt-2">{additionalStats.totalGroups}</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  Growth compared to last month
                </div>
                <div className="flex items-center gap-1 text-sm mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+8%</span>
                </div>
              </div>
              <div className="absolute right-2 top-2 p-2 rounded-full bg-pink-100">
                <Users className="h-5 w-5 text-pink-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-200 rounded-tl-full opacity-50"></div>
            </Card>
            
            <Card className="p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-medium">Total Resources</h3>
                <p className="text-3xl font-bold mt-2">{additionalStats.totalResources}</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  Growth compared to last month
                </div>
                <div className="flex items-center gap-1 text-sm mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+15%</span>
                </div>
              </div>
              <div className="absolute right-2 top-2 p-2 rounded-full bg-teal-100">
                <BarChart3 className="h-5 w-5 text-teal-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-teal-200 rounded-tl-full opacity-50"></div>
            </Card>
          </div>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Content Distribution</h3>
            <div className="h-[300px]">
              <ClientBarChart
                data={[
                  { name: "Courses", count: additionalStats.totalCourses },
                  { name: "Groups", count: additionalStats.totalGroups },
                  { name: "Resources", count: additionalStats.totalResources },
                  { name: "Messages", count: additionalStats.totalMessages }
                ]}
                xDataKey="name"
                barDataKey="count"
                color="#f59e0b"
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stats card component
interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  change: string;
  positive: boolean;
}

function StatsCard({ title, value, icon: Icon, color, change, positive }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold">{value}</p>
          <p className={`ml-2 flex items-center text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
            <ArrowUpRight className={`h-4 w-4 ${!positive && 'rotate-180'}`} />
          </p>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${color}`}></div>
    </Card>
  );
}

// Additional stats card component
interface AdditionalStatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

function AdditionalStatsCard({ title, value, icon: Icon, color }: AdditionalStatsCardProps) {
  return (
    <Card className="flex items-center gap-4 p-6">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </Card>
  );
}

// Auth protection
export default async function AdminPage() {
  const session = await auth();
  
  if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
    redirect("/auth/login");
  }
  
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboard />
    </Suspense>
  );
} 