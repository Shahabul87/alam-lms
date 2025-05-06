import React from "react";
import Link from "next/link";
import { CreateBlogInputSection } from "./create-blog-input";
import { Sparkles, Lightbulb, BookOpenCheck, Brain, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const CreateNewBlogPage = () => {
  return (
    <section className={cn(
      "min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row",
      "overflow-hidden rounded-xl shadow-2xl",
      "border border-indigo-200/30 dark:border-indigo-800/30",
    )}>
      {/* Left Side - Inspiration/Guidance Panel */}
      <div className={cn(
        "w-full lg:w-1/3 p-6 md:p-8 lg:p-10",
        "bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600",
        "dark:from-indigo-900 dark:via-purple-900 dark:to-violet-900",
        "text-white relative overflow-hidden"
      )}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-pink-400 blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10">
          {/* Logo/Branding */}
          <div className="flex items-center gap-2 mb-12">
            <BookOpenCheck className="w-6 h-6 text-indigo-200" />
            <span className="text-xl font-bold tracking-tight">bdGenAI Blog</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Craft Your <span className="text-indigo-200">Masterpiece</span>
          </h2>
          
          <p className="text-indigo-100/90 mb-10 text-sm md:text-base leading-relaxed">
            Your blog is a canvas for your ideas. Share your knowledge, experiences, and insights with the world.
          </p>

          {/* Inspiration Cards */}
          <div className="space-y-4 mb-10">
            {[
              { icon: Brain, title: "Knowledge Sharing", desc: "Share your expertise with people around the world." },
              { icon: Lightbulb, title: "Inspire Others", desc: "Your insights can spark ideas and change perspectives." },
              { icon: Zap, title: "Build Your Brand", desc: "Establish your reputation as a thought leader." }
            ].map((card, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors duration-300">
                <card.icon className="w-5 h-5 text-indigo-200 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white">{card.title}</h3>
                  <p className="text-xs text-indigo-100/80 mt-1">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-auto pt-6 border-t border-indigo-500/30">
            <p className="text-sm text-indigo-200">
              Already have a blog idea in mind? Start creating it right away!
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="w-full lg:w-2/3 bg-white dark:bg-gray-900 flex flex-col">
        <div className="flex-1 p-6 md:p-8 lg:p-10">
          {/* Top Elements */}
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Create New Blog
            </h1>
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs",
              "bg-indigo-100 dark:bg-indigo-900/40",
              "text-indigo-600 dark:text-indigo-300",
              "border border-indigo-200 dark:border-indigo-700/50",
              "flex items-center gap-1.5"
            )}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creative Mode</span>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="flex items-center justify-center mb-10">
            <div className="w-full max-w-md">
              <div className="flex items-center justify-between relative">
                <div className="h-0.5 bg-indigo-600 absolute left-0 right-0 top-1/2 transform -translate-y-1/2 z-0"></div>
                {["Title", "Content", "Publish"].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                      i === 0 ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    )}>
                      {i + 1}
                    </div>
                    <span className={cn(
                      "text-xs mt-1.5",
                      i === 0 ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Container with Animation */}
          <div className={cn(
            "bg-white dark:bg-gray-800/50",
            "border border-gray-100 dark:border-gray-700/50",
            "rounded-xl shadow-lg overflow-hidden",
            "transition-all duration-300 transform hover:shadow-xl",
            "mx-auto w-full max-w-3xl"
          )}>
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  What's your blog title?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Choose a title that captures attention and reflects your content.
                </p>
              </div>
              <CreateBlogInputSection />
            </div>
          </div>

          {/* Help Tips */}
          <div className="mt-8 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 mx-auto w-full max-w-3xl">
            <h3 className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
              <Lightbulb className="w-4 h-4" />
              Tips for a great blog title
            </h3>
            <ul className="text-xs text-indigo-600/80 dark:text-indigo-300/80 space-y-1 ml-6 list-disc">
              <li>Keep it concise and descriptive</li>
              <li>Use keywords relevant to your content</li>
              <li>Create curiosity to encourage readers</li>
              <li>Consider your target audience</li>
            </ul>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700/50 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <Link href="/" className="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Cancel
          </Link>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Step 1 of 3: Set your title
          </span>
        </div>
      </div>
    </section>
  );
}
