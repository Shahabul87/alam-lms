"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, BookOpen, Users, Star, BarChart, Plus, Search, Filter, CheckCircle2, Award, Zap, Trophy, TrendingUp, Calendar, Target, AlertTriangle } from "lucide-react";

import { CourseCard } from "./course-card";
import { EmptyState } from "./empty-state";
import { CoursesFilterMenu } from "./courses-filter-menu";
import { CourseStats } from "./course-stats";

interface MyCoursesDashboardProps {
  enrolledCourses: any[];
  createdCourses: any[];
  enrolledCoursesError: string | null;
  createdCoursesError: string | null;
  user: any;
}

export const MyCoursesDashboard = ({
  enrolledCourses = [],
  createdCourses = [],
  enrolledCoursesError,
  createdCoursesError,
  user,
}: MyCoursesDashboardProps) => {
  const [tab, setTab] = useState<"enrolled" | "created">("enrolled");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    progress: "all",
    sortBy: "recent"
  });

  // Safe data processing with error protection
  const safeEnrolledCourses = Array.isArray(enrolledCourses) ? enrolledCourses : [];
  const safeCreatedCourses = Array.isArray(createdCourses) ? createdCourses : [];

  // Filter courses based on search and filter settings
  const filteredEnrolledCourses = safeEnrolledCourses
    .filter(course => {
      try {
        // Search filter with safe string access
        const title = course?.title || "";
        if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Category filter with safe access
        const categoryName = course?.category?.name || "";
        if (filters.category !== "all" && categoryName !== filters.category) {
          return false;
        }
        
        // Progress filter with safe number access
        const completionPercentage = course?.completionPercentage || 0;
        if (filters.progress === "completed" && completionPercentage < 100) {
          return false;
        }
        if (filters.progress === "in-progress" && (completionPercentage === 0 || completionPercentage === 100)) {
          return false;
        }
        if (filters.progress === "not-started" && completionPercentage > 0) {
          return false;
        }
        
        return true;
      } catch (error) {
        console.warn("Error filtering enrolled course:", error);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        // Sort based on filter with safe access
        if (filters.sortBy === "recent") {
          const dateA = new Date(a?.enrolledAt || a?.createdAt || 0).getTime();
          const dateB = new Date(b?.enrolledAt || b?.createdAt || 0).getTime();
          return dateB - dateA;
        }
        if (filters.sortBy === "title") {
          return (a?.title || "").localeCompare(b?.title || "");
        }
        if (filters.sortBy === "progress") {
          return (b?.completionPercentage || 0) - (a?.completionPercentage || 0);
        }
        if (filters.sortBy === "rating") {
          return (b?.averageRating || 0) - (a?.averageRating || 0);
        }
        return 0;
      } catch (error) {
        console.warn("Error sorting enrolled courses:", error);
        return 0;
      }
    });

  const filteredCreatedCourses = safeCreatedCourses
    .filter(course => {
      try {
        // Search filter with safe string access
        const title = course?.title || "";
        if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Category filter with safe access
        const categoryName = course?.category?.name || "";
        if (filters.category !== "all" && categoryName !== filters.category) {
          return false;
        }
        
        return true;
      } catch (error) {
        console.warn("Error filtering created course:", error);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        // Sort based on filter with safe access
        if (filters.sortBy === "recent") {
          const dateA = new Date(a?.createdAt || 0).getTime();
          const dateB = new Date(b?.createdAt || 0).getTime();
          return dateB - dateA;
        }
        if (filters.sortBy === "title") {
          return (a?.title || "").localeCompare(b?.title || "");
        }
        if (filters.sortBy === "students") {
          return (b?.totalEnrolled || 0) - (a?.totalEnrolled || 0);
        }
        if (filters.sortBy === "rating") {
          return (b?.averageRating || 0) - (a?.averageRating || 0);
        }
        return 0;
      } catch (error) {
        console.warn("Error sorting created courses:", error);
        return 0;
      }
    });

  // Calculate dashboard stats with safe access
  const totalEnrolledCourses = safeEnrolledCourses.length;
  const completedCourses = safeEnrolledCourses.filter(c => (c?.completionPercentage || 0) === 100).length;
  const inProgressCourses = safeEnrolledCourses.filter(c => {
    const progress = c?.completionPercentage || 0;
    return progress > 0 && progress < 100;
  }).length;
  const totalCreatedCourses = safeCreatedCourses.length;
  const totalStudents = safeCreatedCourses.reduce((acc, course) => acc + (course?.totalEnrolled || 0), 0);
  
  // Calculate average completion rate
  const avgCompletionRate = totalEnrolledCourses > 0 
    ? Math.round(safeEnrolledCourses.reduce((acc, course) => acc + (course?.completionPercentage || 0), 0) / totalEnrolledCourses)
    : 0;

  // Calculate learning streak (mock data for now)
  const learningStreak = 7;

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="w-full py-8">
      {/* Header Section with Hero Design - Full Width */}
      <div className="relative py-16 mb-8 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-900/90"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
        <div className="absolute -top-40 -right-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="text-left">
              <h2 className="text-lg text-gray-300">Welcome back,</h2>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                {user?.name || "Learner"}
              </h1>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto"
          >
            Track your progress, manage your courses, and continue your educational adventure all in one place.
          </motion.p>

          {/* Quick Stats in Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalEnrolledCourses}</div>
              <div className="text-sm text-gray-300">Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{completedCourses}</div>
              <div className="text-sm text-gray-300">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{totalCreatedCourses}</div>
              <div className="text-sm text-gray-300">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{learningStreak}d</div>
              <div className="text-sm text-gray-300">Streak</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Stats Overview Cards - Full Width Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-5 mb-10"
      >
        <CourseStats 
          title="Enrolled Courses"
          value={totalEnrolledCourses}
          icon={<BookOpen className="w-5 h-5 text-blue-400" />}
          change="+3 this month"
          positive={true}
          color="blue"
        />
        
        <CourseStats 
          title="Completed Courses"
          value={completedCourses}
          icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
          change={`${avgCompletionRate}% avg completion`}
          positive={true}
          color="green"
        />
        
        <CourseStats 
          title="Created Courses"
          value={totalCreatedCourses}
          icon={<Award className="w-5 h-5 text-purple-400" />}
          change={totalCreatedCourses > 0 ? `${totalStudents} total students` : "Create your first course"}
          positive={totalCreatedCourses > 0}
          color="purple"
        />
        
        <CourseStats 
          title="Learning Streak"
          value={`${learningStreak} days`}
          icon={<Zap className="w-5 h-5 text-amber-400" />}
          change="Personal best!"
          positive={true}
          color="amber"
        />

        <CourseStats 
          title="In Progress"
          value={inProgressCourses}
          icon={<TrendingUp className="w-5 h-5 text-orange-400" />}
          change="Keep going!"
          positive={true}
          color="orange"
        />

        <CourseStats 
          title="This Month"
          value="24h"
          icon={<Calendar className="w-5 h-5 text-indigo-400" />}
          change="Learning time"
          positive={true}
          color="indigo"
        />
      </motion.div>

      {/* Main Content Area - Full Width */}
      <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden shadow-xl">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200/50 dark:border-gray-800/50">
          <button
            onClick={() => setTab("enrolled")}
            className={`px-6 py-4 font-medium text-sm flex items-center transition-all duration-200 ${
              tab === "enrolled"
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Enrolled Courses
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              tab === "enrolled" 
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}>
              {totalEnrolledCourses}
            </span>
          </button>
          
          <button
            onClick={() => setTab("created")}
            className={`px-6 py-4 font-medium text-sm flex items-center transition-all duration-200 ${
              tab === "created"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Created Courses
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              tab === "created" 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}>
              {totalCreatedCourses}
            </span>
          </button>
          
          <div className="flex-1"></div>
          
          {/* Search & Filter */}
          <div className="flex items-center px-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg text-sm text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent w-64 transition-all duration-200"
              />
              <Search className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`ml-2 p-2 border rounded-lg transition-all duration-200 ${
                filterOpen 
                  ? "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700/50"
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Filter Dropdown */}
        {filterOpen && (
          <CoursesFilterMenu 
            filters={filters}
            setFilters={setFilters}
            onClose={() => setFilterOpen(false)}
            activeTab={tab}
          />
        )}

        {/* Courses Grid - Full Width */}
        <div className="p-6">
          {tab === "enrolled" && (
            <>
              {enrolledCoursesError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {enrolledCoursesError}
                  </div>
                </motion.div>
              )}
              
              {filteredEnrolledCourses.length === 0 ? (
                <EmptyState 
                  title="No enrolled courses found"
                  description={
                    searchQuery 
                      ? "Try adjusting your search or filters" 
                      : "Explore our course catalog to start your learning journey"
                  }
                  icon={<BookOpen className="w-10 h-10 text-gray-500" />}
                  actionLink="/discover"
                  actionText="Browse Courses"
                />
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                >
                  {filteredEnrolledCourses.map((course, index) => (
                    <motion.div 
                      key={course?.id || index}
                      variants={variants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <CourseCard 
                        course={course}
                        type="enrolled"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}

          {tab === "created" && (
            <>
              {createdCoursesError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {createdCoursesError}
                  </div>
                </motion.div>
              )}
              
              <div className="flex justify-end mb-6">
                <Link href="/teacher/courses/create">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Course
                  </motion.button>
                </Link>
              </div>
              
              {filteredCreatedCourses.length === 0 ? (
                <EmptyState 
                  title="You haven't created any courses yet"
                  description="Share your knowledge with the world by creating your first course"
                  icon={<Award className="w-10 h-10 text-gray-500" />}
                  actionLink="/teacher/courses/create"
                  actionText="Create Course"
                />
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                >
                  {filteredCreatedCourses.map((course, index) => (
                    <motion.div 
                      key={course?.id || index}
                      variants={variants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <CourseCard 
                        course={course}
                        type="created"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 