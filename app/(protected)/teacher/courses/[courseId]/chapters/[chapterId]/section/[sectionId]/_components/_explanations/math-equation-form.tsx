"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import axios from "axios";
import TipTapEditor from "@/components/tiptap/editor";
import ContentViewer from "@/components/tiptap/content-viewer";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PlusCircle, Sparkles, XCircle } from "lucide-react";
import "katex/dist/katex.min.css";
import "./styles/editor.css";
import styles from "./styles/editor.module.css";
import { InlineMath, BlockMath } from "react-katex";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MathEquationFormProps {
  initialData: any;
  courseId: string;
  chapterId: string;
  sectionId: string;
  onEquationAdded?: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  equation: z.string().optional(),
  explanation: z.string().optional(),
  imageUrl: z.string().optional(),
  content: z.string().optional(),
  mode: z.enum(["equation", "visual"]),
}).refine((data, ctx) => {
  // For equation mode, require equation and explanation
  if (data.mode === "equation") {
    if (!data.equation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Equation is required in equation mode",
        path: ["equation"]
      });
      return false;
    }
    if (!data.explanation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Explanation is required in equation mode",
        path: ["explanation"]
      });
      return false;
    }
  }
  
  // For visual mode, require either imageUrl or content
  if (data.mode === "visual") {
    if (!data.imageUrl && !data.content) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either an image or rich text content is required in visual mode",
        path: ["content"]
      });
      return false;
    }
  }
  
  return true;
});

export const MathEquationForm = ({
  initialData = { mathExplanations: [] },
  courseId,
  chapterId,
  sectionId,
  onEquationAdded
}: MathEquationFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [editorMode, setEditorMode] = useState<"equation" | "visual">("equation");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Example templates to help users get started
  const templates = [
    { 
      title: "Quadratic Formula", 
      equation: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", 
      explanation: "The quadratic formula helps solve quadratic equations in the form ax² + bx + c = 0." 
    },
    { 
      title: "Pythagorean Theorem", 
      equation: "a^2 + b^2 = c^2", 
      explanation: "In a right triangle, the square of the length of the hypotenuse (c) equals the sum of squares of the other two sides (a and b)." 
    },
    { 
      title: "Derivative Rule", 
      equation: "\\frac{d}{dx}[x^n] = nx^{n-1}", 
      explanation: "The power rule for differentiation states that if you have x raised to a power n, the derivative is n times x raised to the power of n-1." 
    },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      equation: "",
      explanation: "",
      imageUrl: "",
      content: "",
      mode: "equation",
    },
  });

  const { watch, setValue } = form;
  const equation = watch("equation");
  const explanation = watch("explanation");
  const title = watch("title");
  const content = watch("content");
  const formImageUrl = watch("imageUrl");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      console.log("Form values before preparing payload:", values);
      
      // Create a payload that handles both equation and visual modes
      const payload = {
        ...values,
        // For equation mode - ensure empty fields are handled
        equation: values.mode === "equation" ? values.equation : "", 
        
        // For visual mode - set explanation based on content if available
        explanation: values.mode === "visual" && values.content 
          ? values.content 
          : values.explanation || "",
        
        // Content is only relevant for visual mode
        content: values.mode === "visual" ? values.content : "",
        
        // ImageUrl is only relevant for visual mode
        imageUrl: values.mode === "visual" ? values.imageUrl : "",
      };
      
      console.log("Final payload for submission:", payload);
      console.log(`POST to /api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/math-equations`);
      
      // Add validation console log to check form state
      console.log("Form validation state:", {
        isValid: form.formState.isValid,
        errors: form.formState.errors,
        dirtyFields: form.formState.dirtyFields,
        isSubmitting: form.formState.isSubmitting
      });
      
      const response = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/math-equations`, 
        payload
      );
      
      console.log("API Response:", response.data);
      
      toast.success("Math equation added successfully");
      
      // Call the callback to trigger a refresh of the equations list
      if (onEquationAdded) {
        onEquationAdded();
      }
      
      router.refresh();
      form.reset();
      setActiveTab("edit");
    } catch (error: any) {
      console.error("Math equation submission error:", error);
      
      // Extract meaningful error message
      let errorMessage = "Something went wrong";
      if (error.response?.data) {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.uploadedFiles && response.data.uploadedFiles.length > 0) {
        const uploadedUrl = response.data.uploadedFiles[0].url;
        form.setValue("imageUrl", uploadedUrl);
        return uploadedUrl;
      }
      
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle between equation and visual modes
  const toggleEditorMode = (mode: "equation" | "visual") => {
    setEditorMode(mode);
    form.setValue("mode", mode);
    // Reset any errors related to the mode switch
    form.clearErrors();
    
    if (mode === "visual") {
      // Show helpful toast when switching to visual mode
      toast.info("In visual mode, you can add either an image or rich text content");
    }
  };

  const applyTemplate = (template: { title: string; equation: string; explanation: string }) => {
    setValue("title", template.title);
    setValue("equation", template.equation);
    setValue("explanation", template.explanation);
    toast.success("Template applied");
  };

  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      {submitError && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-400 font-medium">Error: {submitError}</p>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            Please try again or check your network connection.
          </p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Editor Column - Now full width */}
            <div className="space-y-6">
              <Card className="border border-pink-200 dark:border-pink-800 shadow-md">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 rounded-t-lg border-b border-pink-100 dark:border-pink-800">
                  <CardTitle className="text-xl bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Create Math Equation
                  </CardTitle>
                  <CardDescription>
                    Add mathematical equations with LaTeX syntax or use visual editor
                  </CardDescription>
                  
                  {/* Editor Mode Selector */}
                  <div className="mt-4">
                    <Tabs 
                      value={editorMode} 
                      onValueChange={(value) => toggleEditorMode(value as "equation" | "visual")}
                      className="w-full"
                    >
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger 
                          value="equation" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                        >
                          <span className="font-mono mr-2">∫</span>
                          Equation Mode
                        </TabsTrigger>
                        <TabsTrigger 
                          value="visual" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                        >
                          <span className="mr-2">🖼️</span>
                          Visual Mode
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4 w-full">
                      <TabsTrigger value="edit" className="data-[state=active]:bg-pink-100 dark:data-[state=active]:bg-pink-900/30">
                        Edit
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="edit" className="space-y-4">
                      {/* Title field - common to both modes */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-700 dark:text-gray-300">
                              Title
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={isSubmitting}
                                placeholder="e.g., 'Quadratic Formula'"
                                {...field}
                                className="border-pink-200 dark:border-pink-800 focus-visible:ring-pink-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Conditional rendering based on editor mode */}
                      {editorMode === "equation" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="equation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold text-gray-700 dark:text-gray-300">
                                    Equation (LaTeX)
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      disabled={isSubmitting}
                                      placeholder="e.g., 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'"
                                      {...field}
                                      className="min-h-24 font-mono text-sm border-pink-200 dark:border-pink-800 focus-visible:ring-pink-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Template card has been moved inside the form */}
                            <Card className="border border-purple-200 dark:border-purple-800 shadow-sm">
                              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-t-lg border-b border-purple-100 dark:border-purple-800 py-3">
                                <CardTitle className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                  <div className="flex items-center">
                                    <Sparkles className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400" />
                                    Quick Templates
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-0">
                                <ScrollArea className="h-[120px]">
                                  <div className="p-2 space-y-2">
                                    {templates.map((template, index) => (
                                      <div 
                                        key={index} 
                                        className={cn(
                                          "p-2 rounded-lg cursor-pointer transition-all text-xs",
                                          "border border-purple-100 dark:border-purple-800",
                                          "hover:bg-purple-50 dark:hover:bg-purple-900/20",
                                          "hover:shadow-sm"
                                        )}
                                        onClick={() => applyTemplate(template)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="bg-white dark:bg-gray-800 p-1 rounded border border-gray-100 dark:border-gray-700 flex-1 text-center">
                                            <InlineMath math={template.equation} />
                                          </div>
                                          <span className="text-purple-700 dark:text-purple-300 font-medium">{template.title}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="explanation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold text-gray-700 dark:text-gray-300">
                                    Explanation
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      disabled={isSubmitting}
                                      placeholder="Explain the mathematical concept..."
                                      {...field}
                                      className="min-h-[280px] border-pink-200 dark:border-pink-800 focus-visible:ring-pink-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* LaTeX tips */}
                            <Card className="border border-purple-200 dark:border-purple-800 shadow-sm">
                              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-t-lg border-b border-purple-100 dark:border-purple-800 py-3">
                                <CardTitle className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                  LaTeX Tips
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-2 pb-3">
                                <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                                  <li><strong className="text-purple-600 dark:text-purple-400">Fractions:</strong> <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded text-[10px]">\frac&#123;numerator&#125;&#123;denominator&#125;</code></li>
                                  <li><strong className="text-purple-600 dark:text-purple-400">Exponents:</strong> <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded text-[10px]">x^&#123;power&#125;</code></li>
                                  <li><strong className="text-purple-600 dark:text-purple-400">Square roots:</strong> <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded text-[10px]">\sqrt&#123;expression&#125;</code></li>
                                </ul>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ) : (
                        /* Visual Mode UI */
                        <div className="space-y-6">
                          {/* Image Upload Section */}
                          <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold text-gray-700 dark:text-gray-300">
                                  Math Equation Image
                                </FormLabel>
                                <div className="flex flex-col space-y-3">
                                  {field.value && (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800">
                                      <img
                                        src={field.value}
                                        alt="Math equation"
                                        className="object-contain w-full h-full"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                          field.onChange("");
                                        }}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {!field.value && (
                                    <div className="flex items-center justify-center w-full">
                                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                          <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                          </svg>
                                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 2MB)</p>
                                        </div>
                                        <input 
                                          type="file" 
                                          className="hidden" 
                                          accept="image/*"
                                          onChange={async (e) => {
                                            if (e.target.files && e.target.files[0]) {
                                              const file = e.target.files[0];
                                              const url = await handleImageUpload(file);
                                              if (url) {
                                                field.onChange(url);
                                              }
                                            }
                                          }}
                                          disabled={isSubmitting || isUploading}
                                        />
                                      </label>
                                    </div>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* TipTap Editor for content */}
                          <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold text-gray-700 dark:text-gray-300">
                                  Explanation
                                </FormLabel>
                                <FormControl>
                                  <div className="border rounded-md border-gray-200 dark:border-gray-700">
                                    <TipTapEditor
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      placeholder="Write an explanation for your math concept..."
                                      editorClassName="text-gray-900 dark:text-gray-100 min-h-[200px]"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-gray-500 mt-1">
                                  {!field.value && !formImageUrl && 
                                    "Either provide rich text content or upload an image above."}
                                </p>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="preview" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 min-h-[20rem]">
                      {previewError ? (
                        <div className="flex items-center justify-center h-full text-red-500">
                          <XCircle className="h-5 w-5 mr-2" />
                          <span>{previewError}</span>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {title && (
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                              {title}
                            </h3>
                          )}
                          
                          {editorMode === "equation" && equation && (
                            <div className="py-4 flex justify-center">
                              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 p-6 rounded-lg shadow-sm w-fit max-w-full overflow-x-auto">
                                <BlockMath math={equation} />
                              </div>
                            </div>
                          )}
                          
                          {editorMode === "visual" && formImageUrl && (
                            <div className="py-4 flex justify-center">
                              <div className="rounded-lg shadow-sm max-w-full overflow-hidden">
                                <img src={formImageUrl} alt={title} className="max-w-full h-auto" />
                              </div>
                            </div>
                          )}
                          
                          {editorMode === "equation" && explanation && (
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {explanation}
                            </div>
                          )}
                          
                          {editorMode === "visual" && content && (
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              <ContentViewer content={content} />
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 rounded-b-lg border-t border-pink-100 dark:border-pink-800 flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      form.reset();
                      setActiveTab("edit");
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Equation
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}; 