"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileQuestion, PlusCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";

interface ExamCreationFormProps {
  courseId: string;
  chapterId: string;
  sectionId: string;
  initialData: any;
}

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  timeLimit: z.string().optional(),
});

export const ExamCreationForm = ({
  courseId,
  chapterId,
  sectionId,
  initialData
}: ExamCreationFormProps) => {
  const [isCreating, setIsCreating] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: "60",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // This will be implemented in the future
    toast.success("Exam creation is coming soon!");
    console.log(values);
    setIsCreating(false);
  };

  return (
    <div className="w-full">
      {!isCreating ? (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <FileQuestion className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Create an Exam</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
            Create quizzes, assignments, and tests to assess your students' understanding of the material
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Exam
          </Button>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-r-lg mb-6">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
              Create a New Exam
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300">
              Set up a new assessment to test your students' knowledge about this section's content.
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                      Exam Title
                    </FormLabel>
                    <FormControl>
                      <Input 
                        disabled={isSubmitting}
                        placeholder="e.g. 'Module 1 Assessment'"
                        {...field}
                        className="bg-white dark:bg-gray-800"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                      Exam Description
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        disabled={isSubmitting}
                        placeholder="Describe what this exam will cover..."
                        {...field}
                        className="bg-white dark:bg-gray-800 min-h-[100px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                      Time Limit (minutes)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        disabled={isSubmitting}
                        {...field}
                        className="bg-white dark:bg-gray-800 w-32"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex items-center gap-x-2">
                <Button
                  disabled={!isValid || isSubmitting}
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                >
                  Create Exam
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}; 