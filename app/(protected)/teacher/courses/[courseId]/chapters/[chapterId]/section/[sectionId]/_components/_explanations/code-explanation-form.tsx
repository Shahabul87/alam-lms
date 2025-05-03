"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Code2, BookOpen, Loader2, PlusCircle } from "lucide-react";
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
      toast.success("Explanation added");
      
      // Clear form-related localStorage on successful submission
      localStorage.removeItem('explanation-code-blocks');
      localStorage.removeItem('explanation-heading');
      
      // But do not close the form automatically - let the user decide
      // setIsCreating(false);
      
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // For the button text, conditionally render only on the client side
  const buttonText = hasMounted && isCreating ? "Cancel" : "Add explanation";

  return (
    <div className={cn(
      "p-4 mt-4 rounded-xl",
      "border border-gray-200 dark:border-gray-700/50",
      "bg-white/50 dark:bg-gray-800/40",
      "hover:bg-gray-50 dark:hover:bg-gray-800/60",
      "transition-all duration-200",
      "backdrop-blur-sm"
    )}>
      {/* Header section */}
      <div className="font-medium flex items-center justify-between mb-6">
        <div className="flex items-center gap-x-2">
          <div className={cn(
            "p-2 w-fit rounded-lg",
            "bg-indigo-50 dark:bg-indigo-500/10"
          )}>
            <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Code Explanations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add code snippets with detailed explanations
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          variant="ghost"
          size="sm"
          className={cn(
            "bg-indigo-50 dark:bg-indigo-500/10",
            "text-indigo-700 dark:text-indigo-300",
            "hover:bg-indigo-100 dark:hover:bg-indigo-500/20",
            "hover:text-indigo-800 dark:hover:text-indigo-200",
            "transition-all duration-200"
          )}
        >
          {buttonText}
          {!hasMounted && "Add explanation"}
        </Button>
      </div>

      {/* Only render the rest if mounted to avoid hydration issues */}
      {hasMounted && (
        <>
          {/* Main content section with design description when not creating */}
          {!isCreating ? (
            <div className="space-y-6">
              <div className="p-6 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20">
                <h4 className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-3">
                  Interactive Code Explanation Design
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold mr-3">1</div>
                      <p className="text-gray-700 dark:text-gray-300">Add multiple code blocks with explanations</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold mr-3">2</div>
                      <p className="text-gray-700 dark:text-gray-300">Code snippet remains fixed while reading explanation</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold mr-3">3</div>
                      <p className="text-gray-700 dark:text-gray-300">Add images to enhance your explanations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-sm">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25"></div>
                      <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-indigo-100 dark:border-indigo-800/50">
                        <div className="flex mb-3">
                          <div className="w-1/2 p-2 bg-gray-900 rounded-l-md">
                            <div className="h-16 font-mono text-xs text-gray-300">
                              {`const example = () => {
  return "code";
};`}
                            </div>
                          </div>
                          <div className="w-1/2 p-2 bg-gray-50 dark:bg-gray-700 rounded-r-md">
                            <div className="h-16 text-xs text-gray-700 dark:text-gray-300">This function returns a string "code"...</div>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <div className="text-xs text-gray-500">Interactive learning experience</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => setIsCreating(true)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create your first block-based explanation
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 dark:border-indigo-400 rounded-r-lg mb-4">
                <h3 className="text-base font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                  Create a New Code Explanation
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-300">
                  Add code snippets with detailed explanations to help students understand complex concepts.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExplanationForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 