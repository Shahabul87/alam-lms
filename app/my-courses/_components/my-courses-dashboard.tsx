"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, BookOpen, Users, Star, BarChart, Plus, Search, Filter, CheckCircle2, Award, Zap, Trophy } from "lucide-react";

import { CourseCard } from "./course-card";
import { EmptyState } from "./empty-state";
import { CoursesFilterMenu } from "./courses-filter-menu";
import { CourseStats } from "./course-stats";

interface MyCoursesDashboardProps {
  enrolledCourses: any[];
  createdCourses: any[];
  enrolledCoursesError: string | null;
  createdCoursesError: string | null;
}

export const MyCoursesDashboard = ({
  enrolledCourses = [],
  createdCourses = [],
  enrolledCoursesError,
  createdCoursesError,
}: MyCoursesDashboardProps) => {
  const [tab, setTab] = useState<"enrolled" | "created">("enrolled");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    progress: "all",
    sortBy: "recent"
  });

  // Filter courses based on search and filter settings
  const filteredEnrolledCourses = enrolledCourses
    .filter(course => {
      // Search filter
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.category !== "all" && course.category?.name !== filters.category) {
        return false;
      }
      
      // Progress filter
      if (filters.progress === "completed" && course.completionPercentage < 100) {
        return false;
      }
      if (filters.progress === "in-progress" && (course.completionPercentage === 0 || course.completionPercentage === 100)) {
        return false;
      }
      if (filters.progress === "not-started" && course.completionPercentage > 0) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort based on filter
      if (filters.sortBy === "recent") {
        return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
      }
      if (filters.sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (filters.sortBy === "progress") {
        return b.completionPercentage - a.completionPercentage;
      }
      if (filters.sortBy === "rating") {
        return b.averageRating - a.averageRating;
      }
      return 0;
    });

  const filteredCreatedCourses = createdCourses
    .filter(course => {
      // Search filter
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.category !== "all" && course.category?.name !== filters.category) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort based on filter
      if (filters.sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (filters.sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (filters.sortBy === "students") {
        return b.totalEnrolled - a.totalEnrolled;
      }
      if (filters.sortBy === "rating") {
        return b.averageRating - a.averageRating;
      }
      return 0;
    });

  // Calculate dashboard stats
  const totalEnrolledCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(c => c.completionPercentage === 100).length;
  const inProgressCourses = enrolledCourses.filter(c => c.completionPercentage > 0 && c.completionPercentage < 100).length;
  const totalCreatedCourses = createdCourses.length;
  const totalStudents = createdCourses.reduce((acc, course) => acc + course.totalEnrolled, 0);
  
  // Activity stats for the visualization
  const recentActivity = [
    { date: "Mon", value: 4 },
    { date: "Tue", value: 7 },
    { date: "Wed", value: 5 },
    { date: "Thu", value: 8 },
    { date: "Fri", value: 12 },
    { date: "Sat", value: 9 },
    { date: "Sun", value: 6 },
  ];

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section with Hero Design */}
      <div className="relative py-16 mb-8 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-900/90"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
        <div className="absolute -top-40 -right-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          >
            My Learning Journey
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto"
          >
            Track your progress, manage your courses, and continue your educational adventure all in one place.
          </motion.p>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
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
          change={`${Math.round((completedCourses / Math.max(totalEnrolledCourses, 1)) * 100)}% completion rate`}
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
          value="7 days"
          icon={<Zap className="w-5 h-5 text-amber-400" />}
          change="Personal best!"
          positive={true}
          color="amber"
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800/50">
          <button
            onClick={() => setTab("enrolled")}
            className={`px-6 py-4 font-medium text-sm flex items-center ${
              tab === "enrolled"
                ? "text-white border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Enrolled Courses
            <span className="ml-2 py-0.5 px-2 rounded-full bg-purple-900/30 text-purple-400 text-xs">
              {enrolledCourses.length}
            </span>
          </button>
          
          <button
            onClick={() => setTab("created")}
            className={`px-6 py-4 font-medium text-sm flex items-center ${
              tab === "created"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Created Courses
            <span className="ml-2 py-0.5 px-2 rounded-full bg-blue-900/30 text-blue-400 text-xs">
              {createdCourses.length}
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
                className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-64"
              />
              <Search className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="ml-2 p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white"
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

        {/* Courses Grid */}
        <div className="p-6">
          {tab === "enrolled" && (
            <>
              {enrolledCoursesError && (
                <div className="p-4 mb-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400">
                  {enrolledCoursesError}
                </div>
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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredEnrolledCourses.map((course) => (
                    <motion.div 
                      key={course.id}
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
                <div className="p-4 mb-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400">
                  {createdCoursesError}
                </div>
              )}
              
              <div className="flex justify-end mb-6">
                <Link href="/teacher/courses/create">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg"
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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredCreatedCourses.map((course) => (
                    <motion.div 
                      key={course.id}
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