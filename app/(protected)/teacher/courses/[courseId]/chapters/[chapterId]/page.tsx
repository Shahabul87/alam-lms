import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterActions } from "./_components/chapter-actions";
import { ChapterLearningOutcomeForm } from "./_components/chapter-learning-outcome-form";
import { ChaptersSectionForm } from "./_components/chapter-section-form";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";



const ChapterIdPage = async (
  props: {
    params: Promise<{ courseId: string; chapterId: string }>
  }
) => {
  const params = await props.params;
  const user = await currentUser();

  if (!user?.id) {
      return redirect("/");
    }





  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId
    },
    include:{
      sections:{
        orderBy:{
          position:"asc"
        }
      }
    }
  });


  if (!chapter) {
    console.error("Chapter not found");
    return redirect("/");
  }
  
  // Super detailed debugging for each required field
  const hasTitle = Boolean(chapter.title);
  const hasDescription = Boolean(chapter.description);
  const hasLearningOutcomes = Boolean(chapter.learningOutcomes);
  const publishedSections = chapter.sections.filter(s => s.isPublished);
  const hasPublishedSection = publishedSections.length > 0;
  
  console.log("====================== CHAPTER DEBUG ======================");
  console.log(`Title: "${chapter.title}" => ${hasTitle}`);
  console.log(`Description: "${chapter.description?.substring(0, 30)}..." => ${hasDescription}`);
  console.log(`Learning Outcomes: "${chapter.learningOutcomes?.substring(0, 30)}..." => ${hasLearningOutcomes}`);
  console.log(`Published Sections: ${publishedSections.length} => ${hasPublishedSection}`);
  console.log("Section details:", chapter.sections.map(s => ({
    id: s.id,
    title: s.title,
    isPublished: s.isPublished
  })));
  console.log("==========================================================");

  // Modified required fields - removed the need for published sections
  const requiredFields = [
    hasTitle,
    hasDescription,
    hasLearningOutcomes,
    // hasPublishedSection - Removed this requirement
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  console.log("Required fields:", requiredFields);
  console.log(`Completed fields: ${completedFields}/${totalFields}`);
  console.log("All complete:", requiredFields.every(Boolean));
  
  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);


  return (
    <div className={cn(
      "min-h-screen p-6",
      "bg-gray-50 dark:bg-gray-900",
      "transition-colors duration-300"
    )}>
      {/* Warning Banner */}
      {!chapter.isPublished && (
        <div className="px-4 sm:px-6">
          <Banner
            variant="warning"
            label="This chapter is unpublished. It will not be visible in the course"
          />
        </div>
      )}

      <div className="p-4 sm:p-6">
        <div className="px-2">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="w-full">
              <Link
                href={`/teacher/courses/${params.courseId}`}
                className={cn(
                  "inline-flex items-center mb-6",
                  "px-4 py-2 text-sm sm:text-base font-medium",
                  "bg-white/40 dark:bg-gray-800/40",
                  "hover:bg-purple-50 dark:hover:bg-purple-500/20",
                  "text-gray-900 dark:text-gray-200",
                  "rounded-lg",
                  "border border-gray-200 dark:border-gray-700/50",
                  "transition-all duration-200",
                  "backdrop-blur-sm",
                  "shadow-lg hover:shadow-purple-500/20"
                )}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to course setup
              </Link>

              {/* Status Card */}
              <div className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center justify-between",
                "w-full p-4 sm:p-6",
                "bg-white/40 dark:bg-gray-800/60",
                "border border-gray-200 dark:border-gray-700/50",
                "rounded-xl backdrop-blur-sm" 
              )}>
                <div className="space-y-2 mb-5 max-w-[300px]">
                  <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">Chapter Creation</h1>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Complete all fields{" "}
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      {completionText}
                    </span>
                  </span>
                </div>
                <ChapterActions
                  disabled={!isComplete}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                  isPublished={chapter.isPublished}
                />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-8 mt-8">
            <div className="space-y-4 sm:space-y-6">
              {/* Customize Section */}
              <div className={cn(
                "p-4 sm:p-6 rounded-xl",
                "bg-white/40 dark:bg-gray-800/40",
                "border border-gray-200 dark:border-gray-700/50",
                "backdrop-blur-sm"
              )}>
                <div className="flex items-center gap-x-3 mb-6">
                  <IconBadge icon={LayoutDashboard} />
                  <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Customize your chapter
                  </h2>
                </div>
                <div className="space-y-6">
                  <ChapterTitleForm
                    initialData={chapter}
                    courseId={params.courseId}
                    chapterId={params.chapterId}
                  />
                  <ChapterLearningOutcomeForm
                    initialData={chapter}
                    courseId={params.courseId}
                    chapterId={params.chapterId}
                  />
                  <ChapterDescriptionForm
                    initialData={chapter}
                    courseId={params.courseId}
                    chapterId={params.chapterId}
                  />
                </div>
              </div>

              {/* Access Settings */}
              <div className={cn(
                "p-4 sm:p-6 rounded-xl",
                "bg-white/40 dark:bg-gray-800/40",
                "border border-gray-200 dark:border-gray-700/50",
                "backdrop-blur-sm"
              )}>
                <div className="flex items-center gap-x-3 mb-6">
                  <IconBadge icon={Eye} />
                  <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Access Settings
                  </h2>
                </div>
                <ChapterAccessForm
                  initialData={chapter}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                />
              </div>
            </div>

            {/* Sections */}
            <div className={cn(
              "p-4 sm:p-6 rounded-xl",
              "bg-white/40 dark:bg-gray-800/40",
              "border border-gray-200 dark:border-gray-700/50",
              "backdrop-blur-sm"
            )}>
              <div className="flex items-center gap-x-3 mb-6">
                <IconBadge icon={Video} />
                <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Chapter Sections
                </h2>
              </div>
              <ChaptersSectionForm
                chapter={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default ChapterIdPage;