import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateNewCoursePage } from "./create-course";
import { cn } from "@/lib/utils";
import { GraduationCap, Sparkles, Compass, Rocket } from "lucide-react";

const CourseCreationPage = async() => {
    const user = await currentUser();

    if(!user?.id){
        return redirect("/");
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header with abstract shapes */}
                <div className="relative mb-10 overflow-hidden rounded-2xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 p-6">
                    {/* Abstract shape decorations */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-200/30 dark:bg-purple-800/20 blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-indigo-200/40 dark:bg-indigo-800/20 blur-xl"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 shadow-md">
                                <GraduationCap className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Course Creator</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Build and share your knowledge with the world</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur px-5 py-3 shadow-sm border border-gray-100 dark:border-gray-700/50">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructor Portal</span>
                                </div>
                            </div>
                            <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 shadow-md">
                                <div className="flex items-center gap-2">
                                    <Rocket className="h-4 w-4" />
                                    <span className="text-sm font-medium">Create Course</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className={cn(
                        "rounded-xl p-4 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm",
                        "border border-white/30 dark:border-gray-700/30 shadow-sm"
                    )}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                <Compass className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">Interactive Learning</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Create engaging courses with videos, quizzes, and assignments</p>
                    </div>
                    
                    <div className={cn(
                        "rounded-xl p-4 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm",
                        "border border-white/30 dark:border-gray-700/30 shadow-sm"
                    )}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">Reach Students</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Share your expertise with students from around the world</p>
                    </div>
                    
                    <div className={cn(
                        "rounded-xl p-4 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm",
                        "border border-white/30 dark:border-gray-700/30 shadow-sm"
                    )}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30">
                                <Rocket className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">Grow Your Brand</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Build your teaching portfolio and establish your expertise</p>
                    </div>
                </div>
                
                {/* Main Content */}
                <div className={cn(
                    "rounded-xl bg-white/80 dark:bg-gray-800/50 shadow-lg backdrop-blur-sm p-8",
                    "border border-white/50 dark:border-gray-700/50"
                )}>
                    <CreateNewCoursePage />
                </div>
            </div>
        </div>
    );
}

export default CourseCreationPage;
