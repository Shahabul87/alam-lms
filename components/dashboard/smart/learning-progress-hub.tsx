"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen,
  PlayCircle,
  Clock,
  CheckCircle,
  Circle,
  TrendingUp,
  Target,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Bookmark
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface LearningProgressHubProps {
  courses: any[];
  enrollments: any[];
  progress: any;
}

export default function LearningProgressHub({ 
  courses, 
  enrollments, 
  progress 
}: LearningProgressHubProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const calculateCourseProgress = (enrollment: any) => {
    // Since we removed deep nesting, use mock progress calculation
    // In a real app, you'd fetch progress data separately
    // Use deterministic calculation to prevent hydration mismatch
    const id = enrollment.course.id || '';
    const hashCode = id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const mockProgress = Math.abs(hashCode) % 100;
    return Math.max(mockProgress, 10); // Ensure minimum 10% progress
  };

  const getNextLesson = (enrollment: any) => {
    // Mock next lesson data since we removed deep nesting
    const mockLessons = [
      "Introduction to React Hooks",
      "State Management with Redux", 
      "Building REST APIs",
      "Database Design Principles",
      "Advanced TypeScript Patterns"
    ];
    
    // Use deterministic selection to prevent hydration mismatch
    const id = enrollment.course.id || '';
    const hashCode = id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const lessonIndex = Math.abs(hashCode) % mockLessons.length;
    const selectedLesson = mockLessons[lessonIndex];
    
    return {
      chapterId: "mock-chapter-1",
      sectionId: "mock-section-1", 
      chapterTitle: "Chapter 1",
      sectionTitle: selectedLesson,
      duration: 25 // Consistent duration
    };
  };

  const activeLearningPaths = enrollments?.slice(0, 4) || [];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Learning Progress Hub</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your learning journey and continue where you left off
              </p>
            </div>
          </div>
          <Link href="/my-courses">
            <Button variant="outline" size="sm">
              View All Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Active
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {enrollments?.length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Done
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isClient ? (enrollments?.filter(e => calculateCourseProgress(e) >= 90).length || 0) : 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                This Week
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                18h
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learning Time</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                Growth
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                92%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
            </div>
          </div>
        </div>

        {/* Active Learning Paths */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-blue-600" />
            Continue Learning
          </h4>
          
          {activeLearningPaths.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeLearningPaths.map((enrollment: any, index: number) => {
                const courseProgress = isClient ? calculateCourseProgress(enrollment) : 50;
                const nextLesson = isClient ? getNextLesson(enrollment) : null;
                const course = enrollment.course;
                
                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <img
                              src={course.imageUrl || "/placeholder-course.jpg"}
                              alt={course.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            {courseProgress >= 90 && (
                              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                {course.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {course.category?.name || "General"}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Users className="h-3 w-3" />
                                  <span>847</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  {courseProgress}%
                                </span>
                              </div>
                              <Progress value={courseProgress} className="h-2" />
                            </div>
                            
                            {isClient && nextLesson && (
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  Next Lesson:
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                  {nextLesson.sectionTitle}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{nextLesson.duration || 15} min</span>
                                  </div>
                                  <Link href={`/course/${course.id}/chapter/${nextLesson.chapterId}/section/${nextLesson.sectionId}`}>
                                    <Button size="sm" className="text-xs">
                                      <PlayCircle className="h-3 w-3 mr-1" />
                                      Continue
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            )}
                            
                            {!isClient && (
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  Next Lesson:
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                  Loading...
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>25 min</span>
                                  </div>
                                  <Button size="sm" className="text-xs" disabled>
                                    <PlayCircle className="h-3 w-3 mr-1" />
                                    Continue
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Active Courses
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Start your learning journey by enrolling in a course
              </p>
              <Link href="/discover">
                <Button>
                  Explore Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 