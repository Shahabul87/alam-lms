"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronDown,
  Video, 
  FileText, 
  Code
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Course, ChapterWithProgress } from "./types";

interface ChapterNavigationProps {
  course: Course;
  chaptersWithProgress: ChapterWithProgress[];
  progressPercentage: number;
  courseId: string;
  sectionId: string;
  expandedChapters: string[];
  toggleChapter: (chapterId: string) => void;
  getContentIcon: (type?: string | null) => JSX.Element;
  sidebarOpen: boolean;
}

export const ChapterNavigation = ({
  course,
  chaptersWithProgress,
  progressPercentage,
  courseId,
  sectionId,
  expandedChapters,
  toggleChapter,
  getContentIcon,
  sidebarOpen,
}: ChapterNavigationProps) => {
  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          exit={{ x: -320 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="fixed lg:sticky top-0 left-0 z-30 w-80 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto"
        >
          <div className="p-6 space-y-6">
            {/* Course Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {course.imageUrl ? (
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {course.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {course.chapters.length} chapters
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Course Progress</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>

            <Separator />

            {/* Chapter Navigation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Course Content
              </h3>
              
              <div className="space-y-2">
                {chaptersWithProgress.map((chapter) => (
                  <div key={chapter.id} className="space-y-2">
                    <div
                      onClick={() => toggleChapter(chapter.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer",
                        chapter.isCurrentChapter 
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                          chapter.progressPercentage === 100
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {chapter.progressPercentage === 100 ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            chapter.position
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={cn(
                            "text-sm font-medium",
                            chapter.isCurrentChapter 
                              ? "text-blue-900 dark:text-blue-100" 
                              : "text-slate-900 dark:text-slate-100"
                          )}>
                            {chapter.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {chapter.completedSections}/{chapter.sections.length} sections
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        expandedChapters.includes(chapter.id) ? "rotate-180" : ""
                      )} />
                    </div>

                    {/* Sections List */}
                    {expandedChapters.includes(chapter.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="pl-6 space-y-1"
                      >
                        {chapter.sections.map((section) => {
                          const isCompleted = section.userProgress.some(p => p.isCompleted);
                          const isCurrentSection = section.id === sectionId;
                          
                          return (
                            <Link
                              key={section.id}
                              href={`/courses/${courseId}/learn/${chapter.id}/sections/${section.id}`}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-md transition-colors text-sm",
                                isCurrentSection
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                                )}
                                {getContentIcon(section.type)}
                              </div>
                              <span className="flex-1 truncate">{section.title}</span>
                              {section.duration && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {section.duration}m
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 