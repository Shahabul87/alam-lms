import { AiTutorContent } from "./_components/ai-tutor-content";
import { currentUser } from '@/lib/auth'
import ConditionalHeader from "../(homepage)/user-header";
import { BookOpen, Brain, GraduationCap, History, Lightbulb, MessagesSquare, Sparkles, Zap } from "lucide-react";

export default async function AiTutorPage() {
  const user = await currentUser();
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <ConditionalHeader user={user} />
      
      {/* Top decoration element */}
      <div className="absolute top-0 right-0 w-1/3 h-48 bg-purple-500/10 blur-3xl rounded-full"></div>
      
      <main className="w-full px-4 sm:px-6 pt-20 pb-16 md:pt-24 md:pb-20">
        <div className="w-full">
          {/* Welcome Section */}
          <div className="mb-8 md:mb-12 relative">
            <div className="absolute -left-10 -top-6 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="absolute right-40 top-10 w-16 h-16 bg-purple-500/20 rounded-full blur-xl"></div>
            
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 max-w-[1920px] mx-auto">
                <div className="flex-1 w-full text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-2 rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">Your Learning Companion</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4 tracking-tight">
                    Learn anything with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI</span> assistance
                  </h1>
                  <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto md:mx-0">
                    Get personalized help, practice problems, and instant feedback from your AI tutor. Study smarter, not harder.
                  </p>
                </div>
                
                <div className="flex-shrink-0 relative mt-6 md:mt-0">
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-slate-800/80 flex items-center justify-center">
                      <GraduationCap className="w-16 h-16 md:w-24 md:h-24 text-purple-400/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10 max-w-[1920px] mx-auto">
            <button className="bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-300 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-700/50 flex items-center gap-3 group">
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-all">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-white font-medium">Quick Question</span>
            </button>
            <button className="bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-300 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-700/50 flex items-center gap-3 group">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-all">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-white font-medium">Start Study Session</span>
            </button>
            <button className="bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-300 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-700/50 flex items-center gap-3 group sm:col-span-2 lg:col-span-1">
              <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-all">
                <History className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-white font-medium">Continue Last Session</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden mb-8 md:mb-10 max-w-[1920px] mx-auto">
            {/* Decorative elements */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"></div>
            
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 md:mb-8">
                <div className="p-3 bg-slate-700/50 rounded-xl">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Interactive Learning Assistant</h2>
                  <p className="text-slate-400 text-sm">Ask anything or choose from suggested topics below</p>
                </div>
              </div>
              
              {/* Suggested Topics */}
              <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                <button className="px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 rounded-full text-sm text-slate-300 transition-all whitespace-nowrap">Mathematics</button>
                <button className="px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 rounded-full text-sm text-slate-300 transition-all whitespace-nowrap">Science</button>
                <button className="px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 rounded-full text-sm text-slate-300 transition-all whitespace-nowrap">Language Arts</button>
                <button className="px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 rounded-full text-sm text-slate-300 transition-all whitespace-nowrap">History</button>
                <button className="px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 rounded-full text-sm text-slate-300 transition-all whitespace-nowrap">Computer Science</button>
              </div>
              
              <div className="space-y-6 relative">
                <AiTutorContent />
              </div>
            </div>
          </div>

          {/* Learning Benefits */}
          <div className="mb-8 md:mb-12 max-w-[1920px] mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 md:mb-6 text-center">How AI Tutor Helps You Learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50 hover:bg-slate-800/50 transition-all hover:border-purple-500/30">
                <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-3 md:mb-4">
                  <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">Personalized Learning</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Adapts to your unique learning style and pace for better understanding.</p>
              </div>
              
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50 hover:bg-slate-800/50 transition-all hover:border-blue-500/30">
                <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-3 md:mb-4">
                  <MessagesSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">Interactive Feedback</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Get immediate explanations and answers to reinforce your understanding.</p>
              </div>
              
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50 hover:bg-slate-800/50 transition-all hover:border-emerald-500/30">
                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-3 md:mb-4">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">24/7 Availability</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Study anytime with unlimited access to help, day or night.</p>
              </div>
              
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50 hover:bg-slate-800/50 transition-all hover:border-amber-500/30">
                <div className="p-3 bg-amber-500/10 rounded-lg w-fit mb-3 md:mb-4">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">Varied Resources</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Access examples, practice problems, and explanations for any subject.</p>
              </div>
            </div>
          </div>
          
          {/* Progress Tracker */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50 max-w-[1920px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Your Learning Journey</h3>
              <button className="text-purple-400 text-sm hover:text-purple-300">View All</button>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 sm:p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <p className="text-white font-medium">Recent Topics</p>
                  <p className="text-slate-400 text-xs sm:text-sm">Track your progress across different subjects</p>
                </div>
                <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs sm:text-sm transition-all">Start New Topic</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-1.5 sm:w-2 h-10 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-xs sm:text-sm font-medium">Calculus</p>
                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full w-[75%]"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-1.5 sm:w-2 h-10 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-xs sm:text-sm font-medium">Physics</p>
                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full w-[45%]"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-1.5 sm:w-2 h-10 bg-emerald-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-xs sm:text-sm font-medium">Chemistry</p>
                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full w-[30%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 