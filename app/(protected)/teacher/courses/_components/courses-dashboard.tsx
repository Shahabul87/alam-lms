"use client";

import { DataTable } from "./data-table";
import { columns } from "./column";
import { Course } from "@prisma/client";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Layers, Plus, BookMarked } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CoursesDashboardProps {
  courses: any[];
  stats: {
    total: number;
    published: number;
    draft: number;
  };
}

export const CoursesDashboard = ({ courses, stats }: CoursesDashboardProps) => {
  return (
    <div className="space-y-8">
      {/* Header with welcome message */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage and track all your courses in one place
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "bg-white dark:bg-gray-800",
            "border border-gray-100 dark:border-gray-700",
            "rounded-xl shadow-sm",
            "p-6",
            "flex items-center space-x-4"
          )}
        >
          <div className={cn(
            "p-3 rounded-full",
            "bg-blue-100 dark:bg-blue-900/30",
            "text-blue-600 dark:text-blue-400"
          )}>
            <Layers size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Courses</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={cn(
            "bg-white dark:bg-gray-800",
            "border border-gray-100 dark:border-gray-700",
            "rounded-xl shadow-sm",
            "p-6",
            "flex items-center space-x-4"
          )}
        >
          <div className={cn(
            "p-3 rounded-full",
            "bg-green-100 dark:bg-green-900/30",
            "text-green-600 dark:text-green-400"
          )}>
            <BookMarked size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.published}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={cn(
            "bg-white dark:bg-gray-800",
            "border border-gray-100 dark:border-gray-700",
            "rounded-xl shadow-sm",
            "p-6",
            "flex items-center space-x-4"
          )}
        >
          <div className={cn(
            "p-3 rounded-full",
            "bg-amber-100 dark:bg-amber-900/30",
            "text-amber-600 dark:text-amber-400"
          )}>
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Drafts</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</h3>
          </div>
        </motion.div>
      </div>

      {/* Create Course Button - Desktop */}
      <div className="hidden md:flex justify-end">
        <Link href="/teacher/create">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-5 w-5 mr-2" />
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Table Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className={cn(
          "rounded-xl overflow-hidden",
          "bg-white dark:bg-gray-800",
          "border border-gray-100 dark:border-gray-700",
          "shadow-sm"
        )}
      >
        <DataTable columns={columns} data={courses} />
      </motion.div>
    </div>
  );
}; 