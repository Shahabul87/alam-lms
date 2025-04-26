"use client"

import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Users, 
  Pencil, 
  Share2, 
  BarChart3,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Pencil,
    title: "Design Your Own Courses",
    description: "Create your courses and build up your skills on your own",
  },
  {
    icon: Share2,
    title: "Share Your Resources",
    description: "Share your courses with others to help them grow and save their time",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Monitor your learning journey and celebrate achievements",
  },
];

// Animation variants
const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: 0.4,
      ease: "easeOut"
    }
  }
};

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.6 + index * 0.1,
      ease: "easeOut"
    }
  })
};

// Floating animation
const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0]
  }
};

// Separate transition object for the floating animation
const floatingTransition = {
  duration: 4,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut"
};

export default function HomeHeroSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <div 
      ref={sectionRef} 
      className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Custom decorative elements */}
      <div className="absolute top-20 right-8 md:right-24 w-64 h-64 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 left-8 md:left-24 w-72 h-72 bg-gradient-to-tr from-blue-500 via-cyan-500 to-teal-500 rounded-full opacity-10 blur-3xl"></div>
      
      {/* Animated particles */}
      <motion.div 
        className="absolute top-1/4 right-1/3 w-3 h-3 bg-purple-400 rounded-full"
        {...floatingAnimation}
        transition={{
          ...floatingTransition,
          delay: 0.2
        }}
      />
      <motion.div 
        className="absolute top-2/3 left-1/4 w-2 h-2 bg-blue-400 rounded-full"
        {...floatingAnimation}
        transition={{
          ...floatingTransition,
          delay: 0.5
        }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/4 w-4 h-4 bg-cyan-400 rounded-full"
        {...floatingAnimation}
        transition={{
          ...floatingTransition,
          delay: 0.8
        }}
      />

      <div className="max-w-7xl mx-auto w-full py-8 md:py-12 lg:py-16 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12">
          <div className="relative">
            <motion.div 
              className="absolute -top-8 -left-8 md:-top-12 md:-left-12 w-16 h-16 md:w-24 md:h-24"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="w-full h-full bg-gradient-to-r from-purple-400 to-blue-500 rounded-full opacity-20 blur-xl"></div>
            </motion.div>
            
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center mt-4 md:mt-0 leading-tight"
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={titleVariants}
            >
              <div className="inline-block relative">
                <span className="text-purple-400">Learn</span>
                <motion.span 
                  className="absolute -top-5 -right-5 md:-top-6 md:-right-6"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                </motion.span>
              </div>{" "}
              Together,{" "}
              <div className="inline-block relative">
                <span className="text-purple-400">Grow</span>
                <motion.span 
                  className="absolute -top-5 -right-5 md:-top-6 md:-right-6"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                >
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                </motion.span>
              </div>{" "}
              <span className="text-white">Together</span>
            </motion.h1>
          </div>

          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto text-center leading-relaxed"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={subtitleVariants}
          >
            Join our collaborative learning platform and connect with students worldwide.
            Share knowledge, exchange ideas, and achieve your academic goals together.
          </motion.p>

          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={buttonVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-12 md:mb-16 lg:mb-20"
          >
            <Link href="/auth/register" className="w-full sm:w-auto group">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto border-0 relative overflow-hidden shadow-lg">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link href="/groups" className="w-full sm:w-auto group">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto border-purple-400 text-purple-400 hover:bg-purple-900/20 backdrop-blur-sm"
              >
                <span className="flex items-center">
                  Find Study Groups
                  <Users className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </span>
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full lg:mt-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                custom={index}
                variants={featureVariants}
                className="relative rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700/50 hover:border-purple-500/30 group"
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="absolute -top-4 left-4 inline-block rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-3 shadow-md transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-300">
                  {feature.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
