"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Code2, BookOpen, Loader2, PlusCircle, Sparkles, Zap, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ExplanationForm } from "./components/explanation-form";


interface CodeExplanationFormProps {
  courseId: string;
  chapterId: string;
  sectionId: string;
  initialData: {
    codeExplanations?: {
      id: string;
      heading: string | null;
      code: string | null;
      explanation: string | null;
    }[];
  };
}

const formSchema = z.object({
  heading: z.string().min(1, {
    message: "Heading is required",
  }),
  code: z.string().min(1, {
    message: "Code is required",
  }),
  explanation: z.string().min(1, {
    message: "Explanation is required",
  }),
});

// Replace the ExplanationPreview component with an improved version
const ExplanationPreview = ({ content }: { content: string }) => (
  <div className={cn(
    "mt-4 p-4 rounded-lg",
    "bg-white/80 dark:bg-gray-800/50",
    "border border-gray-200 dark:border-gray-700",
    "prose prose-gray dark:prose-invert max-w-none"
  )}>
    <ReactMarkdown
      className={cn(
        "text-gray-700 dark:text-gray-300",
        "prose-headings:text-gray-900 dark:prose-headings:text-gray-100",
        "prose-strong:text-gray-900 dark:prose-strong:text-gray-100",
        "prose-code:text-pink-500 dark:prose-code:text-pink-400",
        "prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800/90",
        "prose-pre:text-sm prose-pre:leading-relaxed"
      )}
      components={{
        img: ({ node, ...props }) => (
          <div className="my-4 flex justify-center">
            <img 
              {...props} 
              className="max-h-64 rounded-lg shadow-md" 
              style={{ maxWidth: '100%', height: 'auto' }}
              alt={props.alt || "Explanation image"} 
            />
          </div>
        ),
        span: ({ node, ...props }) => {
          return <span {...props} style={{ ...props.style }} />;
        }
      }}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {content || 'Preview will appear here...'}
    </ReactMarkdown>
  </div>
);

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Use useState with a lazy initializer function
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // Only try to get from localStorage after component has mounted (client-side only)
  useEffect(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Check if the item exists
      if (item) {
        try {
          // Parse stored json
          const parsedValue = JSON.parse(item);
          setStoredValue(parsedValue);
        } catch {
          // If JSON parsing fails, remove the invalid item
          window.localStorage.removeItem(key);
          console.warn(`Invalid JSON in localStorage for key: ${key}, using default value`);
        }
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, [key]); // Run only once when component mounts

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}

export const CodeExplanationForm = ({
  courseId,
  chapterId,
  sectionId,
  initialData = { codeExplanations: [] }
}: CodeExplanationFormProps) => {
  // Initialize with a default value first for SSR
  const [isCreating, setIsCreating] = useLocalStorage('explanation-form-open', false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Add client-side only state to track if the component has mounted
  const [hasMounted, setHasMounted] = useState(false);
  
  // Run after mount to avoid hydration mismatch
  useEffect(() => {
    setHasMounted(true);
    // If there are no explanations yet, default to open state
    if (!initialData?.codeExplanations || initialData.codeExplanations.length === 0) {
      setIsCreating(true);
    }
  }, [initialData?.codeExplanations, setIsCreating]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/explanations`,
        values
      );
      toast.success("Explanation added successfully!");
      
      // Clear form-related localStorage - this will be handled by ExplanationForm component
      // localStorage.removeItem('explanation-code-blocks');
      // localStorage.removeItem('explanation-heading');
      
      // Refresh the page to show the new explanation in the list
      router.refresh();
      
      // Keep the form open for adding more explanations
      // Users can manually close it if they want
      
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // For the button text, conditionally render only on the client side
  const buttonText = hasMounted && isCreating ? "Cancel" : "Add explanation";

  return (
    <div className="w-full">
      {/* Full Width Container with Modern Design */}
      <div className="relative overflow-hidden w-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-950"></div>
        
        {/* Main Content */}
        <div className="relative w-full">
          {/* Hero Header Section - Full Width */}
          <div className="w-full px-6 py-16 bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-emerald-600/10"></div>
              <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-32 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl"></div>
            </div>
            
            {/* Header Content - Full Width */}
            <div className="relative z-10 w-full max-w-7xl mx-auto">
              <div className="flex flex-col xl:flex-row items-center justify-between gap-12">
                <div className="flex-1 text-center xl:text-left">
                  <div className="flex items-center justify-center xl:justify-start gap-6 mb-8">
                    <div className="p-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                      <Code2 className="h-12 w-12 text-white" />
                    </div>
                    <div>
                      <h1 className="text-5xl xl:text-6xl font-bold mb-3 text-white">
                        Code Explainer
                      </h1>
                      <p className="text-xl text-gray-300 font-medium">
                        Transform code into interactive learning experiences
                      </p>
                    </div>
                  </div>
                  
                  {/* Feature Pills - Enhanced Contrast */}
                  <div className="flex flex-wrap justify-center xl:justify-start gap-4 mb-10">
                    <div className="flex items-center gap-3 px-6 py-3 bg-gray-800/80 backdrop-blur-sm rounded-full text-base font-medium text-gray-200 border border-gray-700/50">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                      Interactive
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-gray-800/80 backdrop-blur-sm rounded-full text-base font-medium text-gray-200 border border-gray-700/50">
                      <Zap className="h-5 w-5 text-emerald-400" />
                      Real-time Preview
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-gray-800/80 backdrop-blur-sm rounded-full text-base font-medium text-gray-200 border border-gray-700/50">
                      <Target className="h-5 w-5 text-purple-400" />
                      Student Focused
                    </div>
                  </div>
                </div>
                
                {/* Action Button - Full Width on Small Screens */}
                <div className="w-full xl:w-auto xl:flex-shrink-0">
                  <Button
                    onClick={() => setIsCreating(!isCreating)}
                    size="lg"
                    className={cn(
                      "w-full xl:w-auto px-10 py-5 text-lg font-semibold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105",
                      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
                      "border border-blue-500/30"
                    )}
                  >
                    {hasMounted ? buttonText : "Add explanation"}
                    {!hasMounted && "Add explanation"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section - Full Width */}
          <div className="w-full">
            {/* Only render the rest if mounted to avoid hydration issues */}
            {hasMounted && (
              <>
                {/* Welcome/Demo State */}
                {!isCreating ? (
                  <div className="w-full py-16 px-6">
                    <div className="w-full max-w-7xl mx-auto">
                      {/* Features Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                        <div className="group p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                            <Code2 className="h-10 w-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Code Blocks</h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                            Add syntax-highlighted code snippets that remain visible while students read explanations.
                          </p>
                        </div>
                        
                        <div className="group p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                          <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="h-10 w-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rich Explanations</h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                            Write detailed explanations with markdown support, images, and interactive elements.
                          </p>
                        </div>
                        
                        <div className="group p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="h-10 w-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Interactive Learning</h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                            Students can follow along with code while reading explanations in a split-view layout.
                          </p>
                        </div>
                      </div>
                      
                      {/* Demo Preview */}
                      <div className="w-full bg-gradient-to-br from-gray-900 to-black rounded-3xl p-12 shadow-2xl border border-gray-800">
                        <h3 className="text-4xl font-bold text-white mb-12 text-center">Preview Experience</h3>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-6xl mx-auto">
                          {/* Code Side */}
                          <div className="bg-gray-950 rounded-2xl p-8 border border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                              <span className="text-gray-400 text-base ml-4 font-mono">main.js</span>
                            </div>
                            <pre className="text-green-400 font-mono text-base leading-relaxed">
{`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + 
         fibonacci(n - 2);
}

console.log(fibonacci(10));`}
                            </pre>
                          </div>
                          
                          {/* Explanation Side */}
                          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Understanding Recursion</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                              This function demonstrates recursive computation. The base case prevents infinite recursion...
                            </p>
                            <div className="flex items-center gap-3 text-base text-blue-600 dark:text-blue-400">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              Interactive explanation continues...
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Call to Action - Full Width */}
                      <div className="w-full text-center mt-16">
                        <Button
                          onClick={() => setIsCreating(true)}
                          size="lg"
                          className="w-full max-w-md px-12 py-6 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                          <PlusCircle className="h-6 w-6 mr-3" />
                          Start Creating Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form State - Full Width */
                  <div className="w-full py-16 px-6">
                    <div className="w-full max-w-7xl mx-auto">
                      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Form Header - Full Width */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 px-12 py-10 border-b border-gray-200 dark:border-gray-700">
                          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Create New Code Explanation
                          </h2>
                          <p className="text-xl text-gray-600 dark:text-gray-300">
                            Build an interactive learning experience with code snippets and detailed explanations
                          </p>
                        </div>
                        
                        {/* Form Content - Full Width */}
                        <div className="p-12 w-full">
                          <ExplanationForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 