"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EnrollmentStatsProps {
  enrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageCompletionTime: number; // in days
  enrollmentsByMonth?: Array<{ month: string; count: number }>;
}

export function EnrollmentStats({
  enrolledCourses,
  completedCourses,
  inProgressCourses,
  averageCompletionTime,
  enrollmentsByMonth = []
}: EnrollmentStatsProps) {
  // Calculate completion percentage
  const completionPercentage = Math.round((completedCourses / enrolledCourses) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Enrollment Overview</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your course enrollment statistics and progress
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Enrolled"
          value={enrolledCourses.toString()}
          icon={<BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        />
        
        <StatsCard
          title="Completed"
          value={completedCourses.toString()}
          icon={<GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />}
        />
        
        <StatsCard
          title="In Progress"
          value={inProgressCourses.toString()}
          icon={<Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        />
        
        <StatsCard
          title="Avg. Completion Time"
          value={`${averageCompletionTime} days`}
          icon={<Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Completion Progress</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            <span className="text-sm">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
            <span className="text-sm">Not Started</span>
          </div>
        </div>
      </Card>

      {enrollmentsByMonth.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Enrollment History</h3>
          <div className="space-y-3">
            {enrollmentsByMonth.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{item.month}</span>
                <div className="flex-1 mx-4">
                  <Progress 
                    value={(item.count / Math.max(...enrollmentsByMonth.map(i => i.count))) * 100} 
                    className="h-2" 
                  />
                </div>
                <span className="text-sm font-medium w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          {icon}
        </div>
      </div>
    </Card>
  );
} 