"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoResourcesCard } from "./VideoResourcesCard";
import { BlogResourcesCard } from "./BlogResourcesCard";
import { CodeExplanationForm } from "./_explanations/code-explanation-form";
import { MathEquationForm } from "./_explanations/math-equation-form";
import { ExplanationsList } from "./explanations-list-new";
import { ExamCreationForm } from "./ExamCreationForm";
import { Video, BookOpen, Calculator, Code2, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MathEquationsList } from "./math-equations-list";

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("videos");
  const [mathEquationsRefreshCounter, setMathEquationsRefreshCounter] = useState(0);

  // Get combined explanations list with types
  const combinedExplanations = [
    ...(initialData.mathExplanations || []).map((item: any) => ({
      ...item,
      type: "math"
    })),
    ...(initialData.codeExplanations || []).map((item: any) => ({
      ...item,
      type: "code"
    }))
  ];

  // Edit explanation (navigate to edit page)
  const onEdit = (id: string) => {
    router.push(`/teacher/courses/${courseId}/chapters/${chapterId}/section/${sectionId}/explanations/${id}`);
  };

  // Delete explanation
  const onDelete = async (id: string) => {
    try {
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/explanations/${id}`);
      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  // Create new explanation
  const onCreate = () => {
    router.push(`/teacher/courses/${courseId}/chapters/${chapterId}/section/${sectionId}/explanations/create`);
  };

  // Handle math equation added
  const handleMathEquationAdded = () => {
    setMathEquationsRefreshCounter(prev => prev + 1);
  };

  return (
    <div className="w-full mt-10">
      <div className="w-full bg-gradient-to-r from-purple-100/50 to-cyan-100/50 dark:from-purple-900/20 dark:to-cyan-900/20 p-2 rounded-xl mb-6">
        <Tabs defaultValue="videos" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <TabsContent value="videos" className="animate-fadeIn">
              <VideoResourcesCard 
                chapter={initialData.chapter || {id: "", title: "", sections: []}}
                courseId={courseId}
                chapterId={chapterId}
                sectionId={sectionId}
              />
            </TabsContent>

            <TabsContent value="blogs" className="animate-fadeIn">
              <BlogResourcesCard 
                chapter={initialData.chapter || {id: "", title: "", sections: []}}
                courseId={courseId}
                chapterId={chapterId}
                sectionId={sectionId}
              />
            </TabsContent>

            <TabsContent value="math" className="animate-fadeIn">
              <div className="grid grid-cols-1 gap-6">
                {/* Math editor - now full width */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                        <Calculator className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                        Math Equation Creator
                      </h2>
                    </div>
                    
                    <div className="mt-4">
                      <MathEquationForm 
                        courseId={courseId}
                        chapterId={chapterId}
                        sectionId={sectionId}
                        initialData={initialData}
                        onEquationAdded={handleMathEquationAdded}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Math explanations list - now shown below */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                  <MathEquationsList 
                    courseId={courseId}
                    chapterId={chapterId}
                    sectionId={sectionId}
                    refreshTrigger={mathEquationsRefreshCounter}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="animate-fadeIn">
              <div className="grid grid-cols-1 gap-6">
                {/* Code editor - now full width */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                        <Code2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                        Code Explanation Creator
                      </h2>
                    </div>
                    
                    <div className="mt-4">
                      <CodeExplanationForm 
                        courseId={courseId}
                        chapterId={chapterId}
                        sectionId={sectionId}
                        initialData={initialData}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Code explanations list - now shown below */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                  <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    Created Code Explanations
                  </h3>
                  <ExplanationsList
                    items={combinedExplanations}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onCreateClick={onCreate}
                    type="code"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="exam" className="animate-fadeIn">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                      <FileQuestion className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                      Exam Creator
                    </h2>
                  </div>
                  
                  <div className="mt-4">
                    <ExamCreationForm 
                      courseId={courseId}
                      chapterId={chapterId}
                      sectionId={sectionId}
                      initialData={null}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}; 