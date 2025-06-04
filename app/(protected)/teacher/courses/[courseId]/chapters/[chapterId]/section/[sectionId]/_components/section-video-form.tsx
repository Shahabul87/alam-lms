"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Video, Loader2, YoutubeIcon, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionYoutubeVideoFormProps {
  initialData: {
    videoUrl: string | null;
  };
  courseId: string;
  chapterId: string;
  sectionId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1, {
    message: "Video URL is required",
  }),
});

export const SectionYoutubeVideoForm = ({
  initialData,
  courseId,
  chapterId,
  sectionId,
}: SectionYoutubeVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: initialData?.videoUrl || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}`, values);
      toast.success("Section video updated");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const getVideoId = (url: string) => {
    try {
      return new URL(url).searchParams.get("v");
    } catch {
      return null;
    }
  };

  const openVideoInNewTab = () => {
    if (initialData.videoUrl) {
      window.open(initialData.videoUrl, '_blank');
    }
  };

  return (
    <div className="space-y-3">
      {!isEditing && initialData.videoUrl && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-lg",
            "border border-gray-200/60 dark:border-gray-700/40",
            "bg-white/40 dark:bg-gray-800/30",
            "backdrop-blur-sm"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Video URL
            </span>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs",
                  "bg-emerald-50 dark:bg-emerald-500/10",
                  "text-emerald-700 dark:text-emerald-300",
                  "hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                )}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </>
                )}
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs",
                  "bg-blue-50 dark:bg-blue-500/10",
                  "text-blue-700 dark:text-blue-300",
                  "hover:bg-blue-100 dark:hover:bg-blue-500/20"
                )}
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
          
          {/* Clickable URL Link */}
          <button
            onClick={openVideoInNewTab}
            className={cn(
              "w-full p-2 rounded-md text-left",
              "bg-gray-50 dark:bg-gray-800/50",
              "border border-gray-200/50 dark:border-gray-700/30",
              "hover:bg-gray-100 dark:hover:bg-gray-700/50",
              "transition-all duration-200 group"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate mr-2">
                {initialData.videoUrl}
              </span>
              <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
            </div>
          </button>
        </motion.div>
      )}

      {!isEditing && !initialData.videoUrl && (
        <div className={cn(
          "flex flex-col items-center justify-center",
          "h-24 p-4 rounded-lg",
          "bg-white/40 dark:bg-gray-800/30",
          "border border-dashed border-gray-200 dark:border-gray-700/50"
        )}>
          <Video className="h-6 w-6 mb-2 text-gray-400 dark:text-gray-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No video added
          </p>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <Pencil className="h-3 w-3 mr-1" />
            Add Video URL
          </Button>
        </div>
      )}

      {/* Video Preview */}
      {showPreview && initialData.videoUrl && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className={cn(
            "relative aspect-video rounded-lg overflow-hidden",
            "border border-gray-200 dark:border-gray-700/50",
            "bg-gray-100 dark:bg-gray-900/50",
            "shadow-sm"
          )}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${getVideoId(initialData.videoUrl)}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-lg",
            "border border-gray-200 dark:border-gray-700/50",
            "bg-white/60 dark:bg-gray-800/40",
            "backdrop-blur-sm"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Edit Video URL
            </span>
            <Button
              onClick={() => setIsEditing(false)}
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </Button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={cn(
                          "bg-white dark:bg-gray-900/50",
                          "border-gray-200 dark:border-gray-700/50",
                          "text-gray-900 dark:text-gray-200",
                          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                          "text-sm",
                          "transition-all duration-200"
                        )}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                  </FormItem>
                )}
              />
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
                size="sm"
                className={cn(
                  "w-full bg-emerald-500 hover:bg-emerald-600",
                  "text-white text-sm",
                  "transition-all duration-200",
                  (!isValid || isSubmitting) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-3 w-3" />
                    </motion.div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Video URL"
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
    </div>
  );
};
