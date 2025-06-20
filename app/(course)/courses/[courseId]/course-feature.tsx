"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AiFillStar, AiOutlineClockCircle, AiOutlineUser, AiOutlineCheck } from 'react-icons/ai';
import { Course, Chapter } from '@prisma/client';
import { CourseSocialMediaShare } from './course-social-media-sharing';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";
import parse from 'html-react-parser';
import { cn } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

interface CourseCardProps {
  course: Course & { 
    category?: { name: string } | null;
    reviews?: {
      id: string;
      rating: number;
      createdAt: Date;
    }[];
    chapters?: Chapter[];
    _count?: {
      enrollments: number;
    };
    whatYouWillLearn?: string[];
  };
  userId?: string;
  isEnrolled?: boolean;
}

const CourseCard = ({ course, userId, isEnrolled = false }: CourseCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllObjectives, setShowAllObjectives] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    try {
      if (!userId) {
        // Store the current URL to redirect back after login
        router.push(`/auth/login?callbackUrl=/courses/${course.id}`);
        return;
      }

      setIsLoading(true);
      
      if (!course.price || course.price === 0) {
        try {
          const response = await axios.post(`/api/courses/${course.id}/enroll`);
          toast.success("Successfully enrolled in the course!");
          router.refresh();
          router.push(`/courses/${course.id}/success?success=1`);
        } catch (error: any) {
          toast.error(error.response?.data || "Failed to enroll in the course");
        }
      } else {
        try {
          const response = await axios.post(`/api/courses/${course.id}/checkout`);
          if (response.data.url) {
            window.location.href = response.data.url; // Stripe checkout URL
          }
        } catch (error) {
          toast.error("Failed to initiate payment");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onCheckout = async () => {
    try {
      setIsLoading(true);
      console.log("Starting checkout for course:", course.id);
      
      const response = await axios.post(`/api/courses/${course.id}/checkout`);
      console.log("Checkout response:", response.data);
      
      window.location.assign(response.data.url);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to handle successful payment/enrollment
  useEffect(() => {
    if (window.location.search.includes('success=1')) {
      toast.success("Successfully enrolled in the course!");
      // Use router.push instead of window.location
      router.push("/dashboard/student");
    }
  }, [router]);

  // Calculate average rating
  const averageRating = course.reviews?.length 
    ? (course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length).toFixed(1)
    : "0.0";

  // Get total reviews count
  const totalReviews = course.reviews?.length || 0;

  // Get total enrollments
  const totalEnrollments = course._count?.enrollments || 0;

  // Format last updated date
  const lastUpdated = new Date(course.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const displayedObjectives = course.whatYouWillLearn && course.whatYouWillLearn.length > 0
    ? showAllObjectives 
      ? course.whatYouWillLearn
      : course.whatYouWillLearn.slice(0, 10)
    : ['Comprehensive curriculum', 'Practical exercises', 'Real-world projects', 'Industry best practices'];

  // Sanitize and prepare the HTML content
  const sanitizedDescription = course.description ? DOMPurify.sanitize(course.description) : "";

  return (
    <div className="min-h-screen bg-white/10 dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section with Large Image */}
      <div className="relative h-[60vh] w-full">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={course.imageUrl || '/default-course.jpg'}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-gray-900/50 to-white dark:to-gray-900" />
        </div>

        {/* Course Info Overlay */}
        <div className="absolute inset-0 flex items-center">
          <motion.div 
            className="container mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Enhanced Category Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center"
            >
              <span className="
                px-4 py-2 
                rounded-full 
                bg-white/10 
                backdrop-blur-md 
                border border-white/20
                text-white 
                font-medium
                shadow-lg
                shadow-purple-500/20
                flex items-center gap-2
              ">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                {course.category?.name || 'Category not specified'}
              </span>
            </motion.div>

            {/* Course Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 max-w-4xl"
            >
              {course.title}
            </motion.h1>

            {/* Course Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-6 text-white/90"
            >
              <div className="flex items-center gap-2">
                <AiFillStar className="text-yellow-500 text-2xl" />
                <span className="text-2xl font-semibold">{averageRating}</span>
                <span className="text-white/70">
                  ({totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AiOutlineUser className="text-purple-400 text-xl" />
                <span>
                  {totalEnrollments.toLocaleString()} {totalEnrollments === 1 ? 'student' : 'students'} enrolled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AiOutlineClockCircle className="text-blue-400 text-xl" />
                <span>Last updated {lastUpdated}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50/80 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Course</h2>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div
                  className={cn(
                    "prose prose-gray dark:prose-invert max-w-none",
                    "prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg",
                    "prose-strong:text-gray-900 dark:prose-strong:text-white",
                    "prose-a:text-purple-600 dark:prose-a:text-purple-400",
                    "prose-blockquote:border-l-purple-600 dark:prose-blockquote:border-l-purple-400",
                    "prose-li:marker:text-purple-600 dark:prose-li:marker:text-purple-400",
                    !showFullDescription && "line-clamp-3"
                  )}
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
                {course.description && course.description.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium mt-2"
                  >
                    {showFullDescription ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            </motion.div>

            {/* What You'll Learn */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50/80 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What You&apos;ll Learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {displayedObjectives.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AiOutlineCheck className="text-green-600 dark:text-green-400 text-xl mt-1" />
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 10 && (
                <button
                  onClick={() => setShowAllObjectives(!showAllObjectives)}
                  className="mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
                >
                  {showAllObjectives ? "Show Less" : "Show More"}
                </button>
              )}
            </motion.div>
          </div>

          {/* Right Column - Course Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-50/80 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm h-fit sticky top-4"
          >
            <div className="space-y-6">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={course.imageUrl || '/default-course.jpg'}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="w-full"
              >
                {isEnrolled ? (
                  <button 
                    className="w-full group relative px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-green-500/25"
                    onClick={() => router.push(`/courses/${course.id}/learn`)}
                    disabled={isLoading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Go to Course
                          <span className="text-white/90">✓ Enrolled</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-600/50 to-emerald-600/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                ) : (
                  <button 
                    className="w-full group relative px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-purple-500/25"
                    onClick={handleEnroll}
                    disabled={isLoading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Enroll Now
                          <span className="text-white/90">
                            {course.price ? `$${course.price}` : 'Free'}
                          </span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/50 to-blue-600/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                )}
              </motion.div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Course Features</h3>
                <ul className="space-y-3">
                  {[
                    'Lifetime Access',
                    'Mobile & Desktop Access',
                    'Certificate of Completion',
                    'Downloadable Resources',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <CourseSocialMediaShare courseTitle={course.title} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
