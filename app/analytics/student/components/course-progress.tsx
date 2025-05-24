"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Course {
  id: number;
  name: string;
  progress: number;
  status: string;
}

interface CourseProgressProps {
  courses: Course[];
}

export function CourseProgress({ courses }: CourseProgressProps) {
  const completedCourses = courses.filter(course => course.status === "completed");
  const inProgressCourses = courses.filter(course => course.status === "in-progress");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Course Progress</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your progress across all enrolled courses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm font-medium">Completed ({completedCourses.length})</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-sm font-medium">In Progress ({inProgressCourses.length})</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {completedCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
        
        {inProgressCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: Course;
}

function CourseCard({ course }: CourseCardProps) {
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Not Started</Badge>;
    }
  };
  
  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          {getStatusIcon(course.status)}
          <div className="flex flex-col">
            <h3 className="font-semibold">{course.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(course.status)}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {course.progress}% complete
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-[30%]">
          <Progress value={course.progress} className="h-2 flex-1" />
          <span className="text-sm font-medium w-[40px] text-right">
            {course.progress}%
          </span>
        </div>
      </div>
    </Card>
  );
} 