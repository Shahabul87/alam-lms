import React from "react";
import { CreateCourseInputSection } from "./create-course-input";
import { Rocket, BookOpen, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export const CreateNewCoursePage = () => {
  return (
    <section className="max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full space-y-8">
          {/* Header Section */}
          <div className="relative">
            <div className="absolute -bottom-6 right-12 w-24 h-24 bg-pink-100/50 dark:bg-pink-900/20 rounded-full blur-2xl"></div>
            <div className="absolute -right-4 top-4 w-20 h-20 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-xl"></div>
            
            <div className={cn(
              "rounded-xl p-6 backdrop-blur-sm relative z-10",
              "bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/60 dark:to-gray-800/40",
              "border border-white/50 dark:border-gray-700/50 shadow-sm"
            )}>
              <div className="flex items-center gap-x-4 mb-6">
                <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-400/10 dark:to-indigo-400/10 border border-purple-200/50 dark:border-purple-700/30">
                  <BookOpen className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Course Details
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Let's start by setting up the basics
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={cn(
                  "rounded-lg p-4 flex items-center gap-3",
                  "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10",
                  "border border-purple-100/50 dark:border-purple-700/20"
                )}>
                  <div className="flex-shrink-0 p-2 rounded-full bg-purple-100 dark:bg-purple-800/30">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300">Define your audience</h3>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Who will benefit most?</p>
                  </div>
                </div>
                
                <div className={cn(
                  "rounded-lg p-4 flex items-center gap-3",
                  "bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10",
                  "border border-indigo-100/50 dark:border-indigo-700/20"
                )}>
                  <div className="flex-shrink-0 p-2 rounded-full bg-indigo-100 dark:bg-indigo-800/30">
                    <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Set clear objectives</h3>
                    <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">What will students learn?</p>
                  </div>
                </div>
                
                <div className={cn(
                  "rounded-lg p-4 flex items-center gap-3",
                  "bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10",
                  "border border-blue-100/50 dark:border-blue-700/20"
                )}>
                  <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 dark:bg-blue-800/30">
                    <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Plan your content</h3>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Structure for success</p>
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "rounded-lg p-5",
                "bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/5 dark:to-purple-900/5",
                "border border-indigo-100/30 dark:border-indigo-700/10"
              )}>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  Ready to share your knowledge? Start by giving your course a name and description.
                  You'll be able to add chapters, sections, and content in the next steps.
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className={cn(
            "rounded-xl backdrop-blur-sm",
            "bg-white/80 dark:bg-gray-800/40",
            "border border-white/50 dark:border-gray-700/50 shadow-sm"
          )}>
            <CreateCourseInputSection />
          </div>
        </div>
      </div>
    </section>
  );
}