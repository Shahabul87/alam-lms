"use client";

import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Trophy,
  Calendar, 
  Zap
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface StudentHeaderProps {
  studentName: string;
  enrolledCourses: number;
  completedCourses: number;
  averageScore: number;
  totalLearningHours: number;
  activeDays: number;
  streak: number;
}

export function StudentHeader({
  studentName,
  enrolledCourses,
  completedCourses,
  averageScore,
  totalLearningHours,
  activeDays,
  streak
}: StudentHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{studentName}'s Learning Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive view of learning progress and performance
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <div className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full">
            <Zap className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{streak} Day Streak</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard 
          icon={<BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          label="Enrolled" 
          value={enrolledCourses.toString()}
          helpText="Total courses"
        />
        
        <MetricCard 
          icon={<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
          label="Completed" 
          value={completedCourses.toString()}
          helpText="Finished courses"
        />
        
        <MetricCard 
          icon={<Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
          label="Avg. Score" 
          value={`${averageScore}%`}
          helpText="All assessments"
        />
        
        <MetricCard 
          icon={<Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          label="Learning Time" 
          value={`${totalLearningHours}h`}
          helpText="Total hours"
        />
        
        <MetricCard 
          icon={<Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />}
          label="Active Days" 
          value={activeDays.toString()}
          helpText="Days with activity"
        />
        
        <MetricCard 
          icon={<Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
          label="Current Streak" 
          value={streak.toString()}
          helpText="Consecutive days"
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  helpText: string;
}

function MetricCard({ icon, label, value, helpText }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{helpText}</p>
        </div>
        <div>
          {icon}
        </div>
      </div>
    </Card>
  );
} 