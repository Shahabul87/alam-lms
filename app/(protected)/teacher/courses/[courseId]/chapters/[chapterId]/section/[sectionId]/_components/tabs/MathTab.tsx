"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calculator, Sigma, BookOpen, Sparkles, Zap, Target } from "lucide-react";
import { MathEquationForm } from "../_explanations/math-equation-form";
import { ExplanationsList } from "../explanations-list-new";

interface MathTabProps {
  courseId: string;
  chapterId: string;
  sectionId: string;
  initialData: any;
}

export const MathTab = ({
  courseId,
  chapterId,
  sectionId,
  initialData
}: MathTabProps) => {
  const router = useRouter();
  const [mathEquationsRefreshCounter, setMathEquationsRefreshCounter] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create storage key for this section
  const storageKey = `activeTab_${courseId}_${chapterId}_${sectionId}`;

  // Debounced refresh function to prevent multiple simultaneous calls
  const debouncedRefresh = useCallback(() => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    try {
      router.refresh();
    } catch (error) {
      console.error("Error during router refresh:", error);
    } finally {
      // Reset flag after a delay
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [router, isRefreshing]);

  // Handle math equation added
  const handleMathEquationAdded = useCallback(() => {
    console.log("🔄 Math equation added, refreshing data...");
    setMathEquationsRefreshCounter(prev => prev + 1);
    
    // Ensure we stay on the math tab after adding equation
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'math');
    }
    
    // Use debounced refresh
    debouncedRefresh();
  }, [storageKey, debouncedRefresh]);

  // Edit math explanation (navigate to edit page)
  const handleEdit = useCallback((id: string) => {
    console.log("🔧 Edit math explanation:", id);
    router.push(`/teacher/courses/${courseId}/chapters/${chapterId}/section/${sectionId}/math-equations/${id}`);
  }, [router, courseId, chapterId, sectionId]);

  // Delete math explanation
  const handleDelete = useCallback(async (id: string) => {
    if (isRefreshing) return; // Prevent action during refresh
    
    try {
      console.log("🗑️ Delete math explanation:", id);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/math-equations/${id}`);
      debouncedRefresh();
    } catch (error) {
      console.error("Error deleting math explanation:", error);
      throw error;
    }
  }, [axios, courseId, chapterId, sectionId, debouncedRefresh, isRefreshing]);

  // Create new math explanation
  const handleCreate = useCallback(() => {
    // Scroll to the form section
    const formElement = document.getElementById('math-equation-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Memoize the mapped items to prevent unnecessary re-renders
  const mappedItems = useCallback(() => {
    if (!initialData?.mathExplanations) return [];
    
    return initialData.mathExplanations.map((item: any) => ({
      id: item.id,
      heading: item.title,
      explanation: item.content, // Using content field for explanation
      equation: item.equation,
      imageUrl: item.imageUrl,
      mode: item.mode,
      type: "math" as const
    }));
  }, [initialData?.mathExplanations]);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-2xl p-8 mb-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Sigma className="h-8 w-8 text-white" />
            </div>
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Mathematical Explanations</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Create comprehensive mathematical explanations with equations, visual aids, and detailed descriptions to help students master complex concepts.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Sparkles className="h-6 w-6 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">LaTeX Equations</h3>
              <p className="text-sm text-white/80">Write complex mathematical expressions</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Zap className="h-6 w-6 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Visual Learning</h3>
              <p className="text-sm text-white/80">Upload diagrams and illustrations</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Target className="h-6 w-6 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Clear Explanations</h3>
              <p className="text-sm text-white/80">Step-by-step solutions and reasoning</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Math Equation Form - now full width */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <Calculator className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Math Explanation Creator
              </h2>
            </div>
            
            <div id="math-equation-form" className="mt-4">
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
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Created Math Explanations
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                  <ExplanationsList 
                    key={`${mathEquationsRefreshCounter}-${initialData?.mathExplanations?.length || 0}`} // More stable key
                    items={mappedItems()}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreateClick={handleCreate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 