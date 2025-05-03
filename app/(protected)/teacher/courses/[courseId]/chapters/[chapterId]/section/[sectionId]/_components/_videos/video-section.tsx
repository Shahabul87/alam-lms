"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Video, Loader2, Star, X, Clipboard, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Chapter } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DisplayVideos } from "./display-videos";

interface VideoSectionFormProps {
  chapter: {
    id: string;
    title: string;
    sections: {
      id: string;
      videos: {
        id: string;
        title: string;
        description: string | null;
        url: string | null;
        rating: number | null;
      }[];
    }[];
  };
  courseId: string;
  chapterId: string;
  sectionId: string;
}

const descriptionOptions = [
  "This video provides a comprehensive explanation of core concepts with clear examples",
  "Complex topics are broken down into easily digestible segments with practical demonstrations",
  "Step-by-step tutorial that guides through implementation with best practices",
  "In-depth analysis of advanced concepts with real-world applications",
  "Fundamental principles explained through interactive examples and use cases",
];

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  videoUrl: z.string().url({
    message: "Please enter a valid video URL",
  }),
});

const RatingStars = ({ rating }: { rating: number | null }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= (rating || 0) 
              ? "text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400" 
              : "text-gray-400 dark:text-gray-600"
          )}
        />
      ))}
      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 ml-1">
        {rating}/5
      </span>
    </div>
  );
};

export const VideoSectionForm = ({
  chapter,
  courseId,
  chapterId,
  sectionId,
}: VideoSectionFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [previewData, setPreviewData] = useState<{
    title: string | null;
    description: string | null;
    thumbnail: string | null;
    platform: string | null;
    embedUrl: string | null;
    author: string | null;
  } | null>(null);

  // Filter chapter data to only include current section
  const filteredChapter = {
    ...chapter,
    sections: chapter.sections.filter(section => section.id === sectionId)
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      videoUrl: "",
      description: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const videoUrl = form.watch("videoUrl");

  const fetchVideoMetadata = async (url: string) => {
    if (!url || !z.string().url().safeParse(url).success) return;
    
    try {
      setIsLoadingMetadata(true);
      
      // Call our API to fetch video metadata
      const response = await axios.get(`/api/fetch-video-metadata?url=${encodeURIComponent(url)}`);
      
      if (response.data) {
        const metadata = response.data;
        
        setPreviewData({
          title: metadata.title || null,
          description: metadata.description || null,
          thumbnail: metadata.thumbnail || null,
          platform: metadata.platform || null,
          embedUrl: metadata.embedUrl || null,
          author: metadata.author || null,
        });
        
        if (metadata.title) {
          form.setValue("title", metadata.title);
        }
        
        if (metadata.description) {
          form.setValue("description", metadata.description);
        }
        
        toast.success("Video details fetched successfully");
      } else {
        throw new Error("No metadata returned");
      }
    } catch (error) {
      console.error("Error fetching video metadata:", error);
      toast.error("Could not fetch video details. Please enter them manually.");
      
      // Set default values from URL
      const domain = new URL(url).hostname.replace('www.', '');
      setPreviewData({
        title: `Video from ${domain}`,
        description: null,
        thumbnail: null,
        platform: domain,
        embedUrl: null,
        author: null,
      });
      
      form.setValue("title", `Video from ${domain}`);
      form.setValue("description", descriptionOptions[0]);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Effect to fetch metadata when URL changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'videoUrl' && value.videoUrl && value.videoUrl.startsWith('http')) {
        // Add a small delay before fetching metadata to avoid too many requests during typing
        const timer = setTimeout(() => {
          // Only fetch if URL is valid
          if (!form.formState.errors.videoUrl) {
            fetchVideoMetadata(value.videoUrl);
          }
        }, 500);
        
        return () => clearTimeout(timer);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      if (text.startsWith('http')) {
        form.setValue('videoUrl', text);
        await form.trigger('videoUrl');
        
        // If the URL seems valid, try to fetch metadata
        if (!form.formState.errors.videoUrl) {
          toast.loading("Fetching video details...", { id: "fetching-metadata" });
          await fetchVideoMetadata(text);
          toast.success("Video details found!", { id: "fetching-metadata" });
        }
      } else {
        toast.error("Clipboard content is not a valid URL");
      }
    } catch (err) {
      console.error("Error accessing clipboard:", err);
      toast.error("Unable to access clipboard");
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedRating(0);
    setHoveredRating(0);
    setPreviewData(null);
    setIsCreating(false);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/videos`,
        {
          ...values,
          rating: selectedRating,
          thumbnail: previewData?.thumbnail || null,
          platform: previewData?.platform || null,
          embedUrl: previewData?.embedUrl || null,
          author: previewData?.author || null,
        }
      );

      toast.success("Video added successfully");
      resetForm();
      router.refresh();
    } catch (error: any) {
      console.error("Video creation error:", error);
      toast.error(error.response?.data || "Failed to add video");
    }
  };

  const getVideoId = (url: string) => {
    try {
      return new URL(url).searchParams.get("v");
    } catch {
      return null;
    }
  };

  const handleVideoClick = (url: string) => {
    // Handle video click
    window.open(url, '_blank');
  };

  return (
    <div className={cn(
      "p-4 mt-4 rounded-xl",
      "border border-gray-200 dark:border-gray-700/50",
      "bg-white/50 dark:bg-gray-800/40",
      "hover:bg-gray-50 dark:hover:bg-gray-800/60",
      "transition-all duration-200",
      "backdrop-blur-sm"
    )}>
      <div className="font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2">
        <div className="flex items-center gap-x-2">
          <div className={cn(
            "p-2 w-fit rounded-lg",
            "bg-blue-50 dark:bg-blue-500/10"
          )}>
            <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Additional Video Resources
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add helpful video resources for better understanding
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          variant="ghost"
          size="sm"
          className={cn(
            "bg-blue-50 dark:bg-blue-500/10",
            "text-blue-700 dark:text-blue-300",
            "hover:bg-blue-100 dark:hover:bg-blue-500/20",
            "hover:text-blue-800 dark:hover:text-blue-200",
            "w-full sm:w-auto",
            "justify-center",
            "transition-all duration-200"
          )}
        >
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Add video
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-4"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Video URL <span className="text-blue-500">*</span>
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              placeholder="Enter YouTube or Vimeo URL"
                              className={cn(
                                "bg-white dark:bg-gray-900/50",
                                "border-gray-200 dark:border-gray-700/50",
                                "text-gray-900 dark:text-gray-200",
                                "pl-10 pr-20",
                                "focus:ring-blue-500/20",
                                "text-sm",
                                "transition-all duration-200"
                              )}
                            />
                          </FormControl>
                          <Video className="absolute left-3 top-3 h-4 w-4 text-blue-500 dark:text-blue-400" />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={pasteFromClipboard}
                              className="h-7 px-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                              <Clipboard className="h-4 w-4 mr-1" />
                              <span className="text-xs">Paste</span>
                            </Button>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange("");
                                  setPreviewData(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <FormMessage className="text-rose-500 dark:text-rose-400 text-sm" />
                        <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                          Enter a URL from YouTube, Vimeo, or other video platforms
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {isLoadingMetadata && (
                    <div className="flex justify-center py-8">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Fetching video details...</p>
                      </div>
                    </div>
                  )}

                  {previewData && !isLoadingMetadata && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-blue-100 dark:border-blue-800/30 overflow-hidden bg-white dark:bg-gray-800/60 shadow-md"
                    >
                      <div className="relative h-[200px] w-full bg-gray-100 dark:bg-gray-700">
                        {previewData.thumbnail ? (
                          <div className="h-full w-full relative group overflow-hidden">
                            <img
                              src={previewData.thumbnail}
                              alt={previewData.title || "Video thumbnail"}
                              className="object-cover h-full w-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallbackEl = document.getElementById(`video-thumbnail-fallback-${Date.now()}`);
                                if (fallbackEl) fallbackEl.style.display = 'flex';
                              }}
                            />
                            <div 
                              id={`video-thumbnail-fallback-${Date.now()}`}
                              className="hidden absolute inset-0 h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30"
                            >
                              <Video className="h-16 w-16 text-blue-300 dark:text-blue-500" />
                            </div>
                            
                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-black/60 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform">
                                <Play className="h-8 w-8 text-white fill-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                            <Video className="h-16 w-16 text-blue-300 dark:text-blue-500" />
                          </div>
                        )}
                        {previewData.platform && (
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                            <span className="text-white text-xs font-medium">{previewData.platform}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 dark:text-gray-300">Video Title</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Video title"
                                  className="text-base font-medium border border-gray-200 dark:border-gray-700 bg-transparent"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {previewData.author && (
                          <div className="mt-2 flex items-center">
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300 mr-2">
                              {previewData.author.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{previewData.author}</span>
                          </div>
                        )}
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel className="text-gray-700 dark:text-gray-300">Description</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-transparent border-gray-200 dark:border-gray-700 h-20">
                                    <SelectValue placeholder="Select or enter a description" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[240px]">
                                  {/* Include the current description if it's not in the options */}
                                  {field.value && !descriptionOptions.includes(field.value) && (
                                    <SelectItem value={field.value}>{field.value}</SelectItem>
                                  )}
                                  {/* Predefined description options */}
                                  {descriptionOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate this video's quality</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onMouseEnter={() => setHoveredRating(rating)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setSelectedRating(rating)}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star
                                  className={cn(
                                    "h-6 w-6 transition-colors duration-200",
                                    (rating <= (hoveredRating || selectedRating))
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  )}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {selectedRating > 0 ? `${selectedRating}/5` : "Select rating"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className={cn(
                              "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
                              "text-white border-0",
                              "shadow-md hover:shadow-lg transition-all"
                            )}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add Video Resource"
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!previewData && !isLoadingMetadata && videoUrl && z.string().url().safeParse(videoUrl).success && (
                    <p className="text-sm text-rose-500 dark:text-rose-400 italic">
                      We couldn't fetch details for this video. Please check if the URL is correct and accessible.
                    </p>
                  )}
                </div>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>

      <DisplayVideos 
        videos={filteredChapter.sections[0]?.videos || []}
        onVideoClick={handleVideoClick}
      />
    </div>
  );
};
