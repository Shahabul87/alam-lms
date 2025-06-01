"use client";

import { useState, useEffect } from "react";
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
  const [isMounted, setIsMounted] = useState(false);
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
    mode: "onChange", // Validate on change to catch errors early
  });

  // Simple mount effect
  useEffect(() => {
    setIsMounted(true);
    console.log("🔧 Component mounted");
  }, []);

  // Don't render form until component is mounted
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Debug form setup
  console.log("🔍 Form setup complete:", {
    defaultValues: form.formState.defaultValues,
    errors: form.formState.errors,
    isValid: form.formState.isValid
  });

  const { watch, setValue } = form;
  const equation = watch("equation");
  const explanation = watch("explanation");
  const title = watch("title");
  const content = watch("content");
  const formImageUrl = watch("imageUrl");

  // Custom validation function to avoid Zod refinement issues
  const validateFormData = (values: z.infer<typeof formSchema>) => {
    const errors: string[] = [];
    
    if (!values.title?.trim()) {
      errors.push("Title is required");
    }
    
    if (values.mode === "equation") {
      if (!values.equation?.trim()) {
        errors.push("Equation is required in equation mode");
      }
      if (!values.explanation?.trim()) {
        errors.push("Explanation is required in equation mode");
      }
    }
    
    if (values.mode === "visual") {
      const hasImage = values.imageUrl?.trim();
      const hasContent = values.content?.trim();
      if (!hasImage && !hasContent) {
        errors.push("Either an image or content is required in visual mode");
      }
    }
    
    return errors;
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast.error('File size must be less than 4MB');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/math-equations/image`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.secure_url) {
        onChange(data.secure_url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("Something went wrong during upload");
      console.error(error);
    } finally {
      setIsUploading(false);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("🚀 Form onSubmit triggered with values:", values);
    console.log("🔍 Current editor mode:", editorMode);
    console.log("🔍 Form mode value:", values.mode);
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Ensure the mode value matches the current editor mode
      const currentMode = editorMode;
      const submitValues = {
        ...values,
        mode: currentMode
      };
      
      console.log("📝 Submit values with corrected mode:", submitValues);
      
      // Custom validation based on current editor mode (not form mode)
      const validationErrors: string[] = [];
      
      if (!submitValues.title?.trim()) {
        validationErrors.push("Title is required");
      }
      
      if (currentMode === "equation") {
        if (!submitValues.equation?.trim()) {
          validationErrors.push("Equation is required in equation mode");
        }
        if (!submitValues.explanation?.trim()) {
          validationErrors.push("Explanation is required in equation mode");
        }
      } else if (currentMode === "visual") {
        const hasImage = submitValues.imageUrl?.trim();
        const hasContent = submitValues.content?.trim();
        if (!hasImage && !hasContent) {
          validationErrors.push("Either an image or content is required in visual mode");
        }
      }
      
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join("; ");
        setSubmitError(errorMessage);
        toast.error(errorMessage);
        console.log("❌ Validation failed:", validationErrors);
        return;
      }
      
      console.log("✅ Validation passed, preparing payload...");
      
      // Prepare the payload based on current editor mode
      let finalPayload;
      
      if (currentMode === "visual") {
        console.log("📸 Visual mode payload preparation");
        
        finalPayload = {
          title: submitValues.title,
          mode: "visual",
          imageUrl: submitValues.imageUrl || "",
          content: submitValues.content || "",
          explanation: submitValues.content || "", // Use content as explanation for visual mode
          equation: "", // No equation in visual mode
        };
        
        console.log("📸 Visual mode payload prepared:", finalPayload);
        
      } else {
        console.log("📝 Equation mode payload preparation");
        
        finalPayload = {
          title: submitValues.title,
          mode: "equation",
          equation: submitValues.equation,
          explanation: submitValues.explanation,
          imageUrl: "", // No image in equation mode
          content: "", // No content in equation mode
        };
        
        console.log("📝 Equation mode payload prepared:", finalPayload);
      }
      
      console.log("🚀 Final payload for submission:", finalPayload);
      console.log(`📡 POST to /api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/math-equations`);
      
      const response = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/math-equations`, 
        finalPayload
      );
      
      console.log("✅ API Response:", response.data);
      
      toast.success("Math equation added successfully");
      
      // Call the callback to trigger a refresh of the equations list
      if (onEquationAdded) {
        onEquationAdded();
      }
      
      router.refresh();
      form.reset({
        title: "",
        equation: "",
        explanation: "",
        imageUrl: "",
        content: "",
        mode: "equation",
      });
      setEditorMode("equation");
      setActiveTab("edit");
    } catch (error: any) {
      console.error("❌ Math equation submission error:", error);
      
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

  // Toggle between equation and visual modes
  const toggleEditorMode = (mode: "equation" | "visual") => {
    console.log("🔄 Switching to mode:", mode);
    setEditorMode(mode);
    
    // Update form mode
    form.setValue("mode", mode, { shouldValidate: true });
    // Reset any errors related to the mode switch
    form.clearErrors();
    
    // Clear fields that don't apply to the new mode
    if (mode === "visual") {
      form.setValue("equation", "");
      form.setValue("explanation", "");
      toast.info("Visual mode: Add an image or rich text content");
    } else {
      form.setValue("imageUrl", "");
      form.setValue("content", "");
      toast.info("Equation mode: Write LaTeX equation and explanation");
    }
  };

  const applyTemplate = (template: { title: string; equation: string; explanation: string }) => {
    form.setValue("title", template.title);
    form.setValue("equation", template.equation);
    form.setValue("explanation", template.explanation);
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
                          {/* Image and Explanation Side by Side Layout */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Image Upload */}
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-semibold text-gray-700 dark:text-gray-300">
                                      Math Equation Image
                                    </FormLabel>
                                    <FormControl>
                                      <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-6">
                                        {field.value ? (
                                          <div className="relative">
                                            <img 
                                              src={field.value} 
                                              alt="Math equation" 
                                              className="max-w-full h-auto rounded-lg mx-auto"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => field.onChange("")}
                                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                            >
                                              <XCircle className="h-4 w-4" />
                                            </button>
                                          </div>
                                        ) : (
                                          <div>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleImageUpload(e, field.onChange)}
                                              className="hidden"
                                              disabled={isUploading}
                                              id="mathEquationImageUpload"
                                            />
                                            <label
                                              htmlFor="mathEquationImageUpload"
                                              className={cn(
                                                "flex flex-col items-center justify-center gap-4",
                                                "w-full p-6 sm:p-8",
                                                "border-2 border-dashed rounded-xl",
                                                "border-blue-200 dark:border-blue-500/20",
                                                "bg-blue-50/50 dark:bg-blue-500/5",
                                                "cursor-pointer",
                                                "hover:border-blue-300 dark:hover:border-blue-500/30",
                                                "hover:bg-blue-50 dark:hover:bg-blue-500/10",
                                                "transition-all duration-200",
                                                isUploading && "opacity-50 cursor-not-allowed"
                                              )}
                                            >
                                              <div className="p-4 rounded-full bg-blue-100/50 dark:bg-blue-500/10">
                                                {isUploading ? (
                                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                ) : (
                                                  <PlusCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                )}
                                              </div>
                                              <div className="text-center space-y-1">
                                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                  {isUploading ? "Uploading..." : "Click to upload math equation image"}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                  PNG, JPG, or GIF (Max 4MB)
                                                </p>
                                              </div>
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Right Column - Explanation */}
                            <div className="space-y-4">
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
                                          editorClassName="text-gray-900 dark:text-gray-100 min-h-[320px]"
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
                          </div>
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
                        <div className="space-y-4">
                          {title && (
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                              {title}
                            </h3>
                          )}
                          
                          {/* Two Column Layout for Preview */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                            {/* Left Column - Equation/Image */}
                            <div className="flex flex-col">
                              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                                {editorMode === "equation" ? "Mathematical Equation" : "Equation Image"}
                              </h4>
                              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                {editorMode === "equation" && equation ? (
                                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-full overflow-x-auto">
                                    <BlockMath math={equation} />
                                  </div>
                                ) : editorMode === "visual" && formImageUrl ? (
                                  <div className="rounded-lg shadow-sm max-w-full overflow-hidden">
                                    <img src={formImageUrl} alt={title} className="max-w-full h-auto rounded-lg" />
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-500 dark:text-gray-400">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                      {editorMode === "equation" ? "∫" : "🖼️"}
                                    </div>
                                    <p className="text-sm">
                                      {editorMode === "equation" ? "No equation entered" : "No image uploaded"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Column - Explanation */}
                            <div className="flex flex-col">
                              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                                Explanation
                              </h4>
                              <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                                <div className="h-full bg-white dark:bg-gray-800 rounded-md p-4 overflow-y-auto max-h-[350px]">
                                  {editorMode === "equation" && explanation ? (
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                      {explanation}
                                    </div>
                                  ) : editorMode === "visual" && content ? (
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                      <ContentViewer content={content} />
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                      <div>
                                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                          📝
                                        </div>
                                        <p className="text-sm">No explanation provided</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
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
                    onClick={() => {
                      console.log("🔘 Submit button clicked!");
                      console.log("📊 Current state:", {
                        editorMode,
                        formMode: form.getValues().mode,
                        isSubmitting,
                        formErrors: form.formState.errors,
                        formValues: form.getValues(),
                        isValid: form.formState.isValid
                      });
                    }}
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