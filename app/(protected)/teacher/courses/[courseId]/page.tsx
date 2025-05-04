import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CircleDollarSign, File, LayoutDashboard, ListChecks, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";

import { CategoryForm } from "./_components/category-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ChaptersForm } from "./_components/chapters-form";
import { Actions } from "./_components/actions";
import { IconBadge } from "@/components/icon-badge";

import { cn } from "@/lib/utils";
import { CourseImageUpload } from "./_components/course-image-upload";
import { WhatYouWillLearnForm } from "./_components/what-you-will-learn-form";



const CourseIdPage = async (props:{params: Promise<{courseId:string}>}) => {
  const params = await props.params;


  const user:any = await currentUser();

  if(!user?.id){
      return redirect("/");
  }

  const userId = user?.id;

  const course = await db.course.findUnique({
   where: {
     id: params.courseId,
     userId
   },
   include: {
     chapters: {
       orderBy: {
         position: "asc",
       },
     },
     attachments: {
       orderBy: {
         createdAt: "desc",
       },
     },
   },
 });

  //console.log(course)

  const categories = await db.category.findMany({
   orderBy: {
     name: "asc",
   },
 });

  if (!course) {
   return redirect("/");
 }

  // Define sections as individual items for tracking completion
  const sections = {
    titleDesc: Boolean(course.title && course.description),
    learningObj: Boolean(course.whatYouWillLearn && course.whatYouWillLearn.length > 0),
    image: Boolean(course.imageUrl),
    pricing: Boolean(course.price !== null && course.price !== undefined),
    category: Boolean(course.categoryId),
    // Chapter is complete if there's at least one chapter
    chapters: Boolean(course.chapters.length > 0),
    attachments: Boolean(course.attachments.length > 0)
  };

  // Log sections status to help debug
  console.log("Sections status:", sections);
  console.log("Completed sections:", Object.values(sections).filter(Boolean).length);

  // Calculate completed sections
  const sectionValues = Object.values(sections);
  const completedSections = sectionValues.filter(Boolean).length;
  const totalSections = sectionValues.length;
  
  // Allow publishing if at least 2 sections are completed
  const minSectionsRequired = 2;
  const isPublishable = completedSections >= minSectionsRequired;
  
  const completionText = `(${completedSections}/${totalSections})`;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white dark:from-gray-900 dark:via-gray-850 dark:to-gray-800">
      <div className="pt-8 pb-20">
        {/* Header Section with integrated Banner and Course Setup */}
        <div className="px-4 md:px-8 mb-8">
          <div className={cn(
            "relative overflow-hidden rounded-2xl",
            "border border-gray-200/70 dark:border-gray-700/50",
            "bg-white dark:bg-gray-800",
            "shadow-lg"
          )}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/50 dark:bg-purple-900/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
            
            {/* Banner for unpublished status */}
            {!course.isPublished && (
              <div className="relative border-b border-orange-200 dark:border-orange-800/30">
                <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                    </div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      This course is unpublished. It will not be visible to students.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Course Setup Header */}
            <div className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 shadow-md">
                      <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      Course Setup
                    </h1>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Completion {completionText}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full max-w-xs h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          completionPercentage < 30 ? "bg-amber-500" : 
                          completionPercentage < 70 ? "bg-indigo-500" : 
                          "bg-emerald-500"
                        )}
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    
                    {/* Publication status */}
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      {isPublishable && <CheckCircle2 className="h-4 w-4" />}
                      <span className="text-xs font-medium">
                        {completedSections >= totalSections 
                          ? "All sections completed!" 
                          : isPublishable 
                            ? `${completedSections}/${minSectionsRequired}+ sections complete - Ready to publish` 
                            : `${completedSections}/${minSectionsRequired} sections needed to publish`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Actions
                  disabled={!isPublishable}
                  courseId={params.courseId}
                  isPublished={course.isPublished}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="px-4 md:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column */}
            <div className="space-y-6 md:space-y-8">
              <div className={cn(
                "rounded-xl",
                "border border-gray-200/70 dark:border-gray-700/50",
                "bg-white dark:bg-gray-800",
                "shadow-md p-5 md:p-7",
                sections.titleDesc ? "border-l-4 border-emerald-500" : ""
              )}>
                <div className="flex items-center gap-x-3 mb-6">
                  <IconBadge icon={LayoutDashboard} variant={sections.titleDesc ? "success" : "default"} />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Basic Information
                    {sections.titleDesc && (
                      <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                        (Completed)
                      </span>
                    )}
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <TitleForm initialData={course} courseId={course.id} />
                  <div className={cn(
                    "rounded-md overflow-hidden",
                    sections.titleDesc ? "border-l-4 border-emerald-500" : ""
                  )}>
                    <DescriptionForm initialData={course} courseId={course.id} />
                  </div>
                  <div className={cn(
                    sections.learningObj ? "border-l-4 border-emerald-500 pl-4 py-2" : ""
                  )}>
                    <div className="flex items-start gap-x-2">
                      {sections.learningObj && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="w-full">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          Learning Objectives
                          {sections.learningObj && (
                            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                              (Completed)
                            </span>
                          )}
                        </h3>
                        <WhatYouWillLearnForm
                          initialData={course}
                          courseId={course.id}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 md:space-y-8">
              {/* Chapters Section */}
              <div className={cn(
                "rounded-xl",
                "border border-gray-200/70 dark:border-gray-700/50",
                "bg-white dark:bg-gray-800",
                "shadow-md p-5 md:p-7",
                sections.chapters ? "border-l-4 border-emerald-500" : ""
              )}>
                <div className="flex items-center gap-x-3 mb-6">
                  <IconBadge icon={ListChecks} variant={sections.chapters ? "success" : "default"} />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Course Chapters
                    {sections.chapters && (
                      <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                        (Completed)
                      </span>
                    )}
                  </h2>
                </div>
                <ChaptersForm initialData={course} courseId={course.id} />
              </div>

              {/* Price Section */}
              <div className={cn(
                "rounded-xl",
                "border border-gray-200/70 dark:border-gray-700/50",
                "bg-white dark:bg-gray-800",
                "shadow-md p-5 md:p-7",
                sections.pricing ? "border-l-4 border-emerald-500" : ""
              )}>
                <div className="flex items-center gap-x-3 mb-6">
                  <IconBadge icon={CircleDollarSign} variant={sections.pricing ? "success" : "default"} />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Sell your course
                    {sections.pricing && (
                      <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                        (Completed)
                      </span>
                    )}
                  </h2>
                </div>
                <PriceForm initialData={course} courseId={course.id} />
              </div>

              {/* Course Settings Section - Moved from left column */}
              <div className={cn(
                "rounded-xl",
                "border border-gray-200/70 dark:border-gray-700/50",
                "bg-white dark:bg-gray-800",
                "shadow-md p-5 md:p-7"
              )}>
                <div className="flex items-center gap-x-3 mb-6">
                  <IconBadge icon={LayoutDashboard} />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Course Settings
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {/* Category */}
                  <div className={cn(
                    "p-4 rounded-md",
                    sections.category ? "border-l-4 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/5" : "bg-gray-50 dark:bg-gray-800/60"
                  )}>
                    <div className="flex items-center gap-x-3 mb-4">
                      <IconBadge icon={ListChecks} size="sm" variant={sections.category ? "success" : "default"} />
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Category
                        {sections.category && (
                          <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                            (Completed)
                          </span>
                        )}
                      </h3>
                    </div>
                    <CategoryForm
                      initialData={course}
                      courseId={course.id}
                      options={categories.map((category) => ({
                        label: category.name,
                        value: category.id,
                      }))}
                    />
                  </div>
                  
                  {/* Course Image */}
                  <div className={cn(
                    "p-4 rounded-md",
                    sections.image ? "border-l-4 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/5" : "bg-gray-50 dark:bg-gray-800/60"
                  )}>
                    <div className="flex items-center gap-x-3 mb-4">
                      <IconBadge icon={File} size="sm" variant={sections.image ? "success" : "default"} />
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Course Image
                        {sections.image && (
                          <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                            (Completed)
                          </span>
                        )}
                      </h3>
                    </div>
                    <CourseImageUpload 
                      courseId={params.courseId}
                      initialImage={course.imageUrl}
                    />
                  </div>
                </div>
              </div>
              
              {/* Attachments Section */}
              <div className={cn(
                "rounded-xl",
                "border border-gray-200/70 dark:border-gray-700/50",
                "bg-white dark:bg-gray-800",
                "shadow-md p-5 md:p-7",
                sections.attachments ? "border-l-4 border-emerald-500" : ""
              )}>
                <div className="flex items-center gap-x-3 mb-6">
                  <IconBadge icon={File} variant={sections.attachments ? "success" : "default"} />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Resources & Attachments
                    {sections.attachments && (
                      <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                        (Completed)
                      </span>
                    )}
                  </h2>
                </div>
                <AttachmentForm initialData={course} courseId={course.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default CourseIdPage;