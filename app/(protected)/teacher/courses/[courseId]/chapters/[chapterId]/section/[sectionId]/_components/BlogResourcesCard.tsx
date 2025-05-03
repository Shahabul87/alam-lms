"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, Loader2, BookOpen, Globe, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogSectionForm } from "./_blogs/blog-section";

interface BlogResourcesCardProps {
  chapter: {
    id: string;
    title: string;
    sections: {
      id: string;
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
      }[];
      videos: any[];
      articles: any[];
      notes: any[];
    }[];
  };
  courseId: string;
  chapterId: string;
  sectionId: string;
}

export const BlogResourcesCard = ({
  chapter,
  courseId,
  chapterId,
  sectionId
}: BlogResourcesCardProps) => {
  return (
    <div className="lg:pl-10 lg:transform lg:translate-y-20">
      <div className={cn(
        "rounded-2xl overflow-hidden",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        "border border-pink-100 dark:border-pink-900/50",
        "bg-gradient-to-br from-white/90 to-pink-50/50 dark:from-gray-800/90 dark:to-pink-900/20",
        "backdrop-blur-sm"
      )}>
        {/* Card Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-600 dark:to-purple-600 p-4">
          <div className="flex items-center">
            <div className={cn(
              "mr-4 p-3 rounded-lg",
              "bg-white/20 dark:bg-white/10",
              "shadow-inner"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 01-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H6zm-.75 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 6.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3A.75.75 0 009 6.75H6z" clipRule="evenodd" />
                <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 01-3 0V6.75z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Blog Resources
              </h2>
              <p className="text-pink-50 text-sm">
                In-depth articles and explanations for deeper understanding
              </p>
            </div>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="p-5">
          <BlogSectionForm 
            chapter={chapter}
            courseId={courseId}
            chapterId={chapterId}
            sectionId={sectionId}
          />
        </div>
      </div>
    </div>
  );
}; 