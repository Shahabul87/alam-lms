"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { Code2 } from "lucide-react";
import { CodeExplanationForm } from "../_explanations/code-explanation-form";
import { ExplanationsList } from "../explanations-list-new";

interface CodeTabProps {
  courseId: string;
  chapterId: string;
  sectionId: string;
  initialData: any;
}

export const CodeTab = ({
  courseId,
  chapterId,
  sectionId,
  initialData
}: CodeTabProps) => {
  const router = useRouter();

  // Get only code explanations and map them properly
  const codeExplanations = (initialData.codeExplanations || []).map((item: any) => ({
    id: item.id,
    heading: item.heading,
    code: item.code,
    explanation: item.explanation,
    type: "code" as const
  }));

  // Edit explanation (navigate to edit page)
  const onEdit = (id: string) => {
    console.log("🔧 Edit code explanation:", id);
    router.push(`/teacher/courses/${courseId}/chapters/${chapterId}/section/${sectionId}/explanations/${id}`);
  };

  // Delete explanation
  const onDelete = async (id: string) => {
    try {
      console.log("🗑️ Delete code explanation:", id);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/explanations/${id}`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting code explanation:", error);
      throw error;
    }
  };

  // Create new explanation
  const onCreate = () => {
    router.push(`/teacher/courses/${courseId}/chapters/${chapterId}/section/${sectionId}/explanations/create`);
  };

  return (
    <div className="animate-fadeIn">
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
            items={codeExplanations}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreateClick={onCreate}
            type="code"
          />
        </div>
      </div>
    </div>
  );
}; 