"use client";

import {
  TrendingUp,
  Clock,
  Award,
  BarChart2
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface StudentMetricsGridProps {
  data: any;
}

export function StudentMetricsGrid({ data }: StudentMetricsGridProps) {
  // Calculate derived metrics
  const completionRate = Math.round((data.completedCourses / data.enrolledCourses) * 100);
  const avgTimePerCourse = Math.round(data.totalLearningHours / (data.completedCourses || 1));
  
  const metrics = [
    {
      name: "Course Completion Rate",
      value: `${completionRate}%`,
      change: "+5%",
      trend: "up",
      description: "Percentage of enrolled courses completed",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      name: "Avg. Time per Course",
      value: `${avgTimePerCourse}h`,
      change: "-2h",
      trend: "down",
      description: "Average time spent completing a course",
      icon: <Clock className="h-5 w-5" />
    },
    {
      name: "Assessment Performance",
      value: `${data.averageScore}%`,
      change: "+3%",
      trend: "up",
      description: "Average score across all assessments",
      icon: <Award className="h-5 w-5" />
    },
    {
      name: "Learning Consistency",
      value: `${Math.round((data.activeDays / 30) * 100)}%`,
      change: "+12%",
      trend: "up",
      description: "Percentage of active learning days in the past month",
      icon: <BarChart2 className="h-5 w-5" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}

interface MetricCardProps {
  name: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  description: string;
  icon: React.ReactNode;
}

function MetricCard({ 
  name, 
  value, 
  change, 
  trend, 
  description, 
  icon
}: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          {icon}
        </span>
        <div className={`flex items-center ${
          trend === "up" 
            ? "text-green-600 dark:text-green-400" 
            : trend === "down" 
            ? "text-red-600 dark:text-red-400" 
            : "text-gray-600 dark:text-gray-400"
        }`}>
          <span className="text-sm font-medium">{change}</span>
          {trend === "up" && (
            <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {trend === "down" && (
            <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{name}</p>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">{description}</p>
    </Card>
  );
} 