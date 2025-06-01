"use server";

import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, LayoutDashboard, Video, PlusCircle, Code2 } from "lucide-react";
import { db } from "@/lib/db";
import { Banner } from "@/components/banner"
import { SectionTitleForm } from "./_components/section-title-form";
import { SectionAccessForm } from "./_components/section-access-form";
import { SectionYoutubeVideoForm } from "./_components/section-video-form";
import { SectionActions } from "./_components/sections-actions";
import { GradientDivider } from "@/components/border";
import { cn } from "@/lib/utils";
import { CodeExplanationForm } from "./_components/_explanations/code-explanation-form";
import { ExplanationActions } from "./_components/explanation-actions";
import { VideoResourcesCard } from "./_components/VideoResourcesCard";
import { BlogResourcesCard } from "./_components/BlogResourcesCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InteractiveSections } from "./_components/interactive-sections";
import { TabsContainer } from "./_components/TabsContainer";

const SectionIdPage = async (
  props: {
    params: Promise<{ courseId: string; chapterId: string; sectionId: string }>
  }
) => {
  const params = await props.params;
  const user = await currentUser();

  if (!user?.id) {
      return redirect("/");
    }

  const section = await db.section.findFirst({
    where: {
      id: params.sectionId,
      chapterId: params.chapterId,
    },
    include: {
      videos: true,
      blogs: true,
      articles: true,
      notes: true,
      codeExplanations: {
        select: {
          id: true,
          heading: true,
          code: true,
          explanation: true,
        }
      },
      mathExplanations: {
        select: {
          id: true,
          title: true,
          content: true,
          latex: true,
          equation: true,
          imageUrl: true,
          mode: true,
        }
      }
    },
  });

  const chapter = await db.chapter.findFirst({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      sections: {
        orderBy: {
          position: "asc",
        },
        include: {
          videos: true,
          blogs: true,
          articles: true,
          notes: true,
          codeExplanations: true,
          mathExplanations: true,
        },
      },
    },
  });

  if (!section) {
    return redirect("/")
  }

  if (!chapter) {
    return redirect("/")
  }

  const requiredFields = [
    section.title,
    section.videoUrl,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <div className={cn(
      "w-full min-h-[calc(100vh-4rem)]",
      "transition-colors duration-300"
    )}>
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Unified header section with banner and navigation */}
        <div className={cn(
          "relative overflow-hidden",
          "rounded-xl border border-gray-200 dark:border-gray-700/50",
          "bg-gradient-to-r from-purple-50/80 via-white/80 to-blue-50/80",
          "dark:from-gray-800/80 dark:via-gray-900/80 dark:to-blue-900/80",
          "backdrop-blur-md shadow-lg"
        )}>
          {/* Back button */}
          <div className="absolute top-4 left-4 z-10">
            <Link
              href={`/teacher/courses/${params.courseId}/chapters/${params.chapterId}`}
              className={cn(
                "inline-flex items-center",
                "px-3 py-2 text-sm font-medium",
                "bg-white/70 dark:bg-gray-800/70",
                "hover:bg-purple-50 dark:hover:bg-purple-900/30",
                "text-gray-900 dark:text-gray-200",
                "rounded-lg",
                "border border-gray-200/50 dark:border-gray-700/30",
                "transition-all duration-200",
                "backdrop-blur-sm",
                "shadow-md hover:shadow-purple-500/20"
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to chapter
            </Link>
          </div>
          
          {/* Section card */}
          <div className="pt-16 pb-6 px-6">
            <div className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center justify-between",
              "w-full p-4 sm:p-6",
              "bg-white/60 dark:bg-gray-800/60",
              "border border-gray-200/70 dark:border-gray-700/30",
              "rounded-xl backdrop-blur-sm"
            )}>
              <div className="flex flex-col gap-y-2 mb-4 sm:mb-0 max-w-[300px]">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent whitespace-nowrap">
                  Section Creation
                </h1>
                <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium tracking-wide">
                  Complete all fields {completionText}
                </span>
              </div>
              <SectionActions
                disabled={!isComplete}
                courseId={params.courseId}
                chapterId={params.chapterId}
                sectionId={params.sectionId}
                isPublished={section.isPublished}
              />
            </div>
          </div>
          
          {/* Publication status banner */}
          {!section.isPublished && (
            <div className={cn(
              "p-3 border-t border-orange-200 dark:border-orange-800/50",
              "bg-gradient-to-r from-orange-100/80 to-amber-100/80",
              "dark:from-orange-950/50 dark:to-amber-950/50",
              "flex items-center justify-center"
            )}>
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">This section is unpublished. It will not be visible in the course</span>
              </div>
            </div>
          )}
        </div>

        {/* Basic Section Information - Two Column Layout */}
        <div className="mt-8">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 h-10 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full mr-3"></div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Basic Section Information
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Title and Access Forms */}
            <div className="space-y-6">
              {/* Section Title Card */}
              <div className={cn(
                "p-5 rounded-2xl",
                "bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-gray-800/80 dark:to-purple-900/20",
                "border border-gray-200/80 dark:border-gray-700/50",
                "shadow-sm hover:shadow-md transition-shadow duration-300",
                "backdrop-blur-sm"
              )}>
                <div className="flex items-center gap-x-3 mb-4">
                  <div className={cn(
                    "p-2.5 rounded-lg",
                    "bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-800/30 dark:to-purple-900/10",
                    "border border-purple-200/50 dark:border-purple-700/30"
                  )}>
                    <LayoutDashboard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Section Title
                  </h3>
                </div>
                <SectionTitleForm
                  initialData={section}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                  sectionId={params.sectionId}
                />
              </div>

              {/* Access Settings Card */}
              <div className={cn(
                "p-5 rounded-2xl",
                "bg-gradient-to-br from-white/80 to-cyan-50/50 dark:from-gray-800/80 dark:to-cyan-900/20",
                "border border-gray-200/80 dark:border-gray-700/50",
                "shadow-sm hover:shadow-md transition-shadow duration-300",
                "backdrop-blur-sm"
              )}>
                <div className="flex items-center gap-x-3 mb-4">
                  <div className={cn(
                    "p-2.5 rounded-lg",
                    "bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-800/30 dark:to-cyan-900/10",
                    "border border-cyan-200/50 dark:border-cyan-700/30"
                  )}>
                    <Eye className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                    Access Settings
                  </h3>
                </div>
                <SectionAccessForm
                  initialData={section}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                  sectionId={params.sectionId}
                />
              </div>
            </div>

            {/* Right Column - Video Link */}
            <div className="h-full flex">
              {/* Video Link Card */}
              <div className={cn(
                "h-full flex-1 p-5 rounded-2xl flex flex-col",
                "bg-gradient-to-br from-white/80 to-emerald-50/50 dark:from-gray-800/80 dark:to-emerald-900/20",
                "border border-gray-200/80 dark:border-gray-700/50",
                "shadow-sm hover:shadow-md transition-shadow duration-300",
                "backdrop-blur-sm"
              )}>
                <div className="flex items-center gap-x-3 mb-4">
                  <div className={cn(
                    "p-2.5 rounded-lg",
                    "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-800/30 dark:to-emerald-900/10",
                    "border border-emerald-200/50 dark:border-emerald-700/30"
                  )}>
                    <Video className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Section Video Link
                  </h3>
                </div>
                <div className="flex-1 flex flex-col">
                  <SectionYoutubeVideoForm
                    initialData={section}
                    courseId={params.courseId}
                    chapterId={params.chapterId}
                    sectionId={params.sectionId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Learning Content with TabsContainer */}
        <div className="mt-24 relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
          
          {/* Section Header with 3D-like effect */}
          <div className="relative">
            <div className="text-center mb-10">
              <div className="inline-block relative">
                <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-emerald-600/20 dark:from-purple-400/20 dark:via-cyan-400/20 dark:to-emerald-400/20 blur-xl rounded-lg"></span>
                <h1 className="relative px-6 py-2 text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 dark:from-purple-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Interactive Learning Content
                </h1>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Create interactive learning materials to help students understand complex concepts
              </p>
            </div>
            
            {/* Use the new TabsContainer component */}
            <TabsContainer 
              courseId={params.courseId} 
              chapterId={params.chapterId} 
              sectionId={params.sectionId}
              initialData={{
                chapter,
                codeExplanations: section.codeExplanations || [],
                mathExplanations: section.mathExplanations || [],
                videos: section.videos || [],
                blogs: section.blogs || [],
                articles: section.articles || [],
                notes: section.notes || []
              }}
            />
          </div>
        </div>

        {/* Add vertical spacing with a divider */}
        <div className="mt-32 mb-16">
          <GradientDivider className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
        </div>
        
      </div>
    </div>
  );
}

export default SectionIdPage;