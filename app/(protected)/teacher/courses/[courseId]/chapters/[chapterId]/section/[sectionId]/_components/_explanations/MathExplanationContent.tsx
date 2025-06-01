"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import { ExplanationItem } from "./types";

interface MathExplanationContentProps {
  item: ExplanationItem;
}

export const MathExplanationContent = ({ item }: MathExplanationContentProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center">
          <BookOpen className="h-5 w-5 mr-3" />
          Math Explanation
        </h3>
      </div>
      
      {/* Two Column Layout for Math Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 min-h-[400px]">
        {/* Left Column - Equation/Image */}
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
            {item.equation ? "Mathematical Equation" : "Equation Image"}
          </h4>
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Display equation if in equation mode and equation exists */}
            {item.mode === "equation" && item.equation && item.equation.trim() ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-x-auto">
                <div className="font-mono text-lg text-center text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {item.equation}
                </div>
              </div>
            ) : 
            /* Display image if in visual mode and image exists */
            item.mode === "visual" && item.imageUrl && item.imageUrl.trim() ? (
              <div className="w-full h-full rounded-lg shadow-sm overflow-hidden">
                <Image 
                  src={item.imageUrl} 
                  alt={item.heading || "Math equation"} 
                  className="w-full h-full object-contain rounded-lg" 
                  style={{ minHeight: '300px', width: '100%', height: '100%' }}
                  width={800}
                  height={600}
                  priority
                />
              </div>
            ) : 
            /* Fallback - show equation if available */
            item.equation && item.equation.trim() ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-x-auto">
                <div className="font-mono text-lg text-center text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {item.equation}
                </div>
              </div>
            ) : 
            /* Another fallback - show image if available */
            item.imageUrl && item.imageUrl.trim() ? (
              <div className="w-full h-full rounded-lg shadow-sm overflow-hidden">
                <Image 
                  src={item.imageUrl} 
                  alt={item.heading || "Math equation"} 
                  width={800}
                  height={600}
                  className="w-full h-full object-contain rounded-lg" 
                  style={{ minHeight: '300px', width: '100%', height: '100%' }}
                  priority
                />
              </div>
            ) : (
              /* No content available */
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-sm">No equation or image available</p>
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
            <div className="h-full bg-white dark:bg-gray-800 rounded-md p-4 overflow-y-auto max-h-[350px] scrollbar-hide">
              {item.explanation && item.explanation.trim() ? (
                <div 
                  className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-purple-600 dark:prose-code:text-purple-400"
                  dangerouslySetInnerHTML={{ __html: item.explanation }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xl">📝</span>
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
  );
}; 