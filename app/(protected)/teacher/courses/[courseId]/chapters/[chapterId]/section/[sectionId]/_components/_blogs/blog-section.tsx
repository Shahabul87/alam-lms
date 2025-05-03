"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, BookOpen, Loader2, Star, Link as LinkIcon, ExternalLink, Globe, X, ChevronDown, ArrowUp, ArrowDown, Clock, Calendar, Clipboard } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BlogSectionFormProps {
  chapter: {
    id: string;
    title: string;
    sections: {
      id: string;
      videos: any[];
      articles: any[];
      notes: any[];
      blogs: {
        id: string;
        title: string;
        description: string | null;
        url: string;
        category: string | null;
        position: number | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
        sectionId: string | null;
        userId: string;
        author: string | null;
        publishedAt: Date | null;
        rating?: number | null;
        thumbnail?: string | null;
        siteName?: string | null;
      }[];
    }[];
  };
  courseId: string;
  chapterId: string;
  sectionId: string;
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  blogUrl: z.string().url({
    message: "Please enter a valid URL",
  }),
  description: z.string().optional(),
});

type SortOption = "rating" | "title" | "newest" | "oldest";

export const BlogSectionForm = ({
  chapter,
  courseId,
  chapterId,
  sectionId,
}: BlogSectionFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [previewData, setPreviewData] = useState<{
    title: string;
    thumbnail: string | null;
    description: string | null;
    siteName: string | null;
    author: string | null;
  } | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  
  // Find the current section's blogs
  const currentSection = chapter.sections.find(section => section.id === sectionId);
  const unfilteredBlogs = currentSection?.blogs || [];

  // Sort blogs based on the selected sort option
  const blogs = [...unfilteredBlogs].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "title":
        return a.title.localeCompare(b.title);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      blogUrl: "",
      description: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const blogUrl = form.watch("blogUrl");

  const fetchBlogMetadata = async (url: string) => {
    if (!url || !z.string().url().safeParse(url).success) return;
    
    try {
      setIsLoadingMetadata(true);
      // Call our real API endpoint to fetch blog metadata
      const response = await axios.get(`/api/fetch-blog-metadata?url=${encodeURIComponent(url)}`);
      
      if (response.data) {
        const metadata = response.data;
        
        setPreviewData({
          title: metadata.title || `Article from ${new URL(url).hostname}`,
          thumbnail: metadata.thumbnail || null,
          description: metadata.description || null,
          siteName: metadata.siteName || new URL(url).hostname.replace('www.', ''),
          author: metadata.author || null,
        });
        
        if (metadata.title) {
          form.setValue("title", metadata.title);
        }
        
        if (metadata.description) {
          form.setValue("description", metadata.description);
        }
        
        toast.success("Blog details fetched successfully");
      } else {
        throw new Error("No metadata returned");
      }
    } catch (error) {
      console.error("Error fetching blog metadata:", error);
      toast.error("Could not fetch blog metadata. Please enter details manually.");
      
      // Set default values from URL
      const domain = new URL(url).hostname.replace('www.', '');
      setPreviewData({
        title: `Article from ${domain}`,
        thumbnail: null,
        description: null,
        siteName: domain,
        author: null,
      });
      
      form.setValue("title", `Article from ${domain}`);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Effect to fetch metadata when URL changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'blogUrl' && value.blogUrl && value.blogUrl.startsWith('http')) {
        // Add a small delay before fetching metadata to avoid too many requests during typing
        const timer = setTimeout(() => {
          // Only fetch if URL is valid
          if (!form.formState.errors.blogUrl) {
            fetchBlogMetadata(value.blogUrl);
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
        form.setValue('blogUrl', text);
        await form.trigger('blogUrl');
        
        // If the URL seems valid, try to fetch metadata
        if (!form.formState.errors.blogUrl) {
          toast.loading("Fetching blog details...", { id: "fetching-metadata" });
          await fetchBlogMetadata(text);
          toast.success("Blog details found!", { id: "fetching-metadata" });
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
        `/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/blogs`,
        {
          title: values.title,
          blogUrl: values.blogUrl,
          description: values.description || previewData?.description || null,
          rating: selectedRating,
          thumbnail: previewData?.thumbnail || null,
          siteName: previewData?.siteName || null,
          author: previewData?.author || null,
        }
      );
      
      toast.success("Blog resource added successfully");
      resetForm();
      router.refresh();
    } catch (error: any) {
      console.error("Error adding blog resource:", error);
      toast.error(error.response?.data || "Failed to add blog resource");
    }
  };

  const handleBlogClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getRatingColor = (rating: number | null | undefined) => {
    if (!rating) return "gray";
    if (rating >= 4) return "green";
    if (rating >= 3) return "blue";
    if (rating >= 2) return "yellow";
    return "red";
  };

  return (
    <div className="relative">
      <div className="font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2 mb-6">
        <div className="flex items-center gap-x-2">
          <div className={cn(
            "p-2 w-fit rounded-lg",
            "bg-pink-50 dark:bg-pink-500/10"
          )}>
            <BookOpen className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              Blog Resources
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add helpful blog articles for deeper understanding
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          variant="ghost"
          size="sm"
          className={cn(
            "bg-pink-50 dark:bg-pink-500/10",
            "text-pink-700 dark:text-pink-300",
            "hover:bg-pink-100 dark:hover:bg-pink-500/20",
            "hover:text-pink-800 dark:hover:text-pink-200",
            "w-full sm:w-auto",
            "justify-center",
            "transition-all duration-200"
          )}
        >
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Add blog
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
            className="overflow-hidden mb-6"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-pink-100 dark:border-pink-800/30">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Enter Blog URL</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 mb-2">We'll automatically fetch the blog's metadata</p>
                
                <FormField
                  control={form.control}
                  name="blogUrl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            placeholder="Enter blog URL (https://...)"
                            className={cn(
                              "bg-white dark:bg-gray-900/50",
                              "border-gray-200 dark:border-gray-700/50",
                              "text-gray-900 dark:text-gray-200",
                              "pl-10 pr-20",
                              "focus:ring-pink-500/20",
                              "transition-all duration-200"
                            )}
                          />
                        </FormControl>
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-pink-500 dark:text-pink-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={pasteFromClipboard}
                            className="h-7 px-2 text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400"
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
                    </FormItem>
                  )}
                />

                {isLoadingMetadata && (
                  <div className="flex justify-center py-8">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Fetching blog metadata...</p>
                    </div>
                  </div>
                )}

                {previewData && !isLoadingMetadata && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-pink-100 dark:border-pink-800/30 overflow-hidden bg-white dark:bg-gray-800/60 shadow-md"
                  >
                    <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
                      {previewData.thumbnail ? (
                        <div className="h-full w-full relative">
                          <img
                            src={previewData.thumbnail}
                            alt={previewData.title}
                            className="object-cover h-full w-full"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallbackEl = document.getElementById(`thumbnail-fallback-${Date.now()}`);
                              if (fallbackEl) fallbackEl.style.display = 'flex';
                            }}
                          />
                          <div 
                            id={`thumbnail-fallback-${Date.now()}`}
                            className="hidden absolute inset-0 h-full w-full flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30"
                          >
                            <BookOpen className="h-16 w-16 text-pink-300 dark:text-pink-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
                          <BookOpen className="h-16 w-16 text-pink-300 dark:text-pink-500" />
                        </div>
                      )}
                      {previewData.siteName && (
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                          <span className="text-white text-xs font-medium">{previewData.siteName}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Blog Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Blog title"
                                className="text-base font-medium border border-gray-200 dark:border-gray-700 bg-transparent"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {previewData.author && (
                        <div className="mt-2 flex items-center">
                          <div className="w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center text-xs font-medium text-pink-600 dark:text-pink-300 mr-2">
                            {previewData.author.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{previewData.author}</span>
                        </div>
                      )}
                      
                      {previewData.description && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{previewData.description}</p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate this blog's quality</p>
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
                            "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600",
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
                            "Add Blog Resource"
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!previewData && !isLoadingMetadata && blogUrl && z.string().url().safeParse(blogUrl).success && (
                  <p className="text-sm text-rose-500 dark:text-rose-400 italic">
                    We couldn't fetch metadata for this URL. Please check if the URL is correct and accessible.
                  </p>
                )}
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog list with sorting */}
      {blogs.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {blogs.length} Blog Resources
            </h4>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[130px] h-8 text-xs bg-white/80 dark:bg-gray-800/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating" className="text-xs">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-2 text-yellow-500" />
                      Highest Rated
                    </div>
                  </SelectItem>
                  <SelectItem value="title" className="text-xs">
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-2 text-gray-500" />
                      Title (A-Z)
                    </div>
                  </SelectItem>
                  <SelectItem value="newest" className="text-xs">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2 text-blue-500" />
                      Newest First
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest" className="text-xs">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2 text-green-500" />
                      Oldest First
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ul className="space-y-2 rounded-xl overflow-hidden bg-white dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50">
            {blogs.map((blog) => (
              <li 
                key={blog.id}
                className="group relative"
              >
                <div 
                  className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => handleBlogClick(blog.url)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-8 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      {blog.title}
                    </h4>
                    <div className="flex items-center mt-1">
                      <div className={cn(
                        "flex items-center gap-0.5 mr-3",
                        `text-${getRatingColor(blog.rating)}-500`
                      )}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < (blog.rating || 0)
                                ? `text-${getRatingColor(blog.rating)}-500 fill-${getRatingColor(blog.rating)}-500`
                                : "text-gray-300 dark:text-gray-600"
                            )}
                          />
                        ))}
                      </div>
                      {blog.siteName && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {blog.siteName}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-pink-500 transition-colors" />

                  {/* Blog card on hover */}
                  <div className="absolute top-full left-0 z-10 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 pointer-events-none group-hover:pointer-events-auto">
                    <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                      {blog.thumbnail && (
                        <div className="relative h-32 w-full bg-gray-100 dark:bg-gray-700">
                          <img
                            src={blog.thumbnail}
                            alt={blog.title}
                            className="object-cover h-full w-full"
                            onError={(e) => {
                              // If image fails to load, hide it
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {blog.siteName && (
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                              <span className="text-white text-xs">{blog.siteName}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-3">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{blog.title}</h5>
                        {blog.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {blog.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {blog.author ? `By ${blog.author}` : 'Unknown author'}
                          </span>
                          <span>
                            {blog.createdAt && format(new Date(blog.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <button className="w-full mt-2 text-xs bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-800/30 text-pink-600 dark:text-pink-400 px-3 py-1.5 rounded transition-colors">
                          Read Article
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {blogs.length === 0 && !isCreating && (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-white/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800/50">
          <BookOpen className="h-12 w-12 text-pink-200 dark:text-pink-800" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">No blog resources added yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Click "Add blog" to enhance learning resources</p>
        </div>
      )}
    </div>
  );
};
