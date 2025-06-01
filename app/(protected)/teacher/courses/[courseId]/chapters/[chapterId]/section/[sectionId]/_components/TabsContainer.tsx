"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, BookOpen, Calculator, Code2, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Import modular tab components
import { VideoTab, BlogTab, MathTab, CodeTab, ExamTab } from "./tabs";

interface TabsContainerProps {
  courseId: string;
  chapterId: string;
  sectionId: string;
  initialData: any;
}

export const TabsContainer = ({
  courseId,
  chapterId,
  sectionId,
  initialData = {}
}: TabsContainerProps) => {
  const [activeTab, setActiveTab] = useState("videos");
  const [isMounted, setIsMounted] = useState(false);

  // Create a unique key for localStorage based on the current section
  const storageKey = `activeTab_${courseId}_${chapterId}_${sectionId}`;

  // Load saved tab from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(storageKey);
      if (savedTab && ['videos', 'blogs', 'math', 'code', 'exam'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }
  }, [storageKey]);

  // Save tab to localStorage whenever it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, value);
    }
  };

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="w-full mt-10">
        <div className="w-full bg-gradient-to-r from-purple-100/50 to-cyan-100/50 dark:from-purple-900/20 dark:to-cyan-900/20 p-2 rounded-xl mb-6">
          <div className="h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-10">
      <div className="w-full bg-gradient-to-r from-purple-100/50 to-cyan-100/50 dark:from-purple-900/20 dark:to-cyan-900/20 p-2 rounded-xl mb-6">
        <Tabs defaultValue="videos" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg">
            <TabsTrigger 
              value="videos" 
              className={cn(
                "flex items-center gap-2",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500",
                "data-[state=active]:text-white dark:data-[state=active]:text-white"
              )}
            >
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="blogs" 
              className={cn(
                "flex items-center gap-2",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500",
                "data-[state=active]:text-white dark:data-[state=active]:text-white"
              )}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Blogs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="math" 
              className={cn(
                "flex items-center gap-2",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500",
                "data-[state=active]:text-white dark:data-[state=active]:text-white"
              )}
            >
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Math</span>
            </TabsTrigger>
            <TabsTrigger 
              value="code" 
              className={cn(
                "flex items-center gap-2",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500",
                "data-[state=active]:text-white dark:data-[state=active]:text-white"
              )}
            >
              <Code2 className="h-4 w-4" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
            <TabsTrigger 
              value="exam" 
              className={cn(
                "flex items-center gap-2",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500",
                "data-[state=active]:text-white dark:data-[state=active]:text-white"
              )}
            >
              <FileQuestion className="h-4 w-4" />
              <span className="hidden sm:inline">Exam</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="videos">
              <VideoTab 
                courseId={courseId}
                chapterId={chapterId}
                sectionId={sectionId}
                initialData={initialData}
              />
            </TabsContent>

            <TabsContent value="blogs">
              <BlogTab 
                courseId={courseId}
                chapterId={chapterId}
                sectionId={sectionId}
                initialData={initialData}
              />
            </TabsContent>

            <TabsContent value="math">
              <MathTab 
                courseId={courseId}
                chapterId={chapterId}
                sectionId={sectionId}
                initialData={initialData}
              />
            </TabsContent>

            <TabsContent value="code">
              <CodeTab 
                courseId={courseId}
                chapterId={chapterId}
                sectionId={sectionId}
                initialData={initialData}
              />
            </TabsContent>

            <TabsContent value="exam">
              <ExamTab 
                courseId={courseId}
                chapterId={chapterId}
                sectionId={sectionId}
                initialData={initialData}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}; 