"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import parse from 'html-react-parser';

interface PostChapterCardProps {
  title: string;
  description: string | null;
  imageUrl?: string | null;
}

const PostChapterCard = ({ title, description, imageUrl }: PostChapterCardProps) => {
  // Calculate split point based on image height (approximately 15 lines of text)
  const linesPerImageHeight = 15;
  const charsPerLine = 50;
  const splitPoint = linesPerImageHeight * charsPerLine;
  
  // Find the nearest period or space to make a natural break
  const findBreakPoint = (text: string, target: number) => {
    if (!text || text.length <= target) return text?.length || 0;
    
    const nextPeriod = text.indexOf('.', target);
    const nextSpace = text.indexOf(' ', target);
    
    if (nextPeriod === -1 && nextSpace === -1) return text.length;
    if (nextPeriod === -1) return nextSpace;
    if (nextSpace === -1) return nextPeriod + 1;
    
    return Math.abs(target - nextPeriod) < Math.abs(target - nextSpace) 
      ? nextPeriod + 1 // Include the period
      : nextSpace;
  };

  const parseHtmlContent = (htmlString: string) => {
    // Check if the content is already wrapped in <p> tags to avoid nesting
    const isPWrapped = htmlString.trim().startsWith('<p>') && htmlString.trim().endsWith('</p>');
    
    return parse(htmlString, {
      replace: (domNode: any) => {
        // Skip the root <p> tag if we're going to render this inside a <p> tag
        if (domNode.type === 'tag' && domNode.name === 'p' && domNode.parent === null && isPWrapped) {
          // Return just the children content of the paragraph
          return domNode.children;
        }
        
        if (domNode.type === 'tag') {
          switch (domNode.name) {
            case 'strong':
            case 'b':
              return <span className="font-bold">{domNode.children.map((child: any) => 
                child.data || (child.children && parse(child.children))
              )}</span>;
            case 'em':
            case 'i':
              return <span className="italic">{domNode.children.map((child: any) => 
                child.data || (child.children && parse(child.children))
              )}</span>;
            case 'u':
              return <span className="underline">{domNode.children.map((child: any) => 
                child.data || (child.children && parse(child.children))
              )}</span>;
          }
        }
        return undefined; // Let the default parser handle it
      }
    });
  };

  const actualSplitPoint = findBreakPoint(description || '', splitPoint);
  const firstHalf = description?.slice(0, actualSplitPoint);
  const secondHalf = description?.slice(actualSplitPoint)?.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "border border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50",
        "backdrop-blur-sm transition-all duration-300",
        "p-6 lg:p-8"
      )}
    >
      {/* Top Section with Image and First Half of Text */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Content Section - Left Side */}
        <div className="flex-1 space-y-4">
          <motion.h3 
            className={cn(
              "text-2xl lg:text-3xl xl:text-4xl font-semibold",
              "bg-gradient-to-r dark:from-purple-200 dark:via-blue-200 dark:to-cyan-200 from-purple-600 via-blue-600 to-cyan-600",
              "bg-clip-text text-transparent tracking-tight",
              "leading-tight"
            )}
          >
            {title}
          </motion.h3>
          
          <motion.div className="space-y-0">
            <motion.div 
              className={cn(
                "text-base lg:text-lg xl:text-xl",
                "text-gray-700 dark:text-gray-300/90 leading-relaxed",
                "tracking-wide font-light",
                "text-justify"
              )}
            >
              {firstHalf && parseHtmlContent(firstHalf)}
            </motion.div>
          </motion.div>
        </div>

        {/* Image Section - Right Side */}
        {imageUrl && (
          <div className="relative w-full lg:w-[45%] h-64 lg:h-80 rounded-lg overflow-hidden flex-shrink-0 mt-6 lg:mt-12">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 dark:from-purple-500/10 to-blue-500/5 dark:to-blue-500/10" />
            <Image
              src={imageUrl}
              alt={title}
              fill
              className={cn(
                "object-cover transition-all duration-500",
                "group-hover:scale-105",
                "rounded-lg"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 dark:from-gray-900/50 to-transparent" />
          </div>
        )}
      </div>

      {/* Bottom Section with Remaining Text */}
      {secondHalf && (
        <div className="mt-6">
          <motion.div 
            className={cn(
              "text-base lg:text-lg xl:text-xl",
              "text-gray-700 dark:text-gray-300/90 leading-relaxed",
              "tracking-wide font-light",
              "text-justify"
            )}
          >
            {parseHtmlContent(secondHalf)}
          </motion.div>

          {/* Decorative Elements */}
          <div className="hidden lg:block mt-6">
            <div className="h-px w-full bg-gradient-to-r from-purple-500/10 dark:from-purple-500/20 via-blue-500/10 dark:via-blue-500/20 to-transparent" />
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-purple-400/30 dark:bg-purple-400/50" />
              <div className="h-1 w-1 rounded-full bg-blue-400/30 dark:bg-blue-400/50" />
              <div className="h-1 w-1 rounded-full bg-cyan-400/30 dark:bg-cyan-400/50" />
            </div>
          </div>
        </div>
      )}

      {/* Hover Effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-purple-500/20 dark:from-purple-500/30 via-blue-500/20 dark:via-blue-500/30 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 dark:via-purple-500/30 to-blue-500/20 dark:to-blue-500/30" />
      </div>
    </motion.div>
  );
};

export default PostChapterCard;

