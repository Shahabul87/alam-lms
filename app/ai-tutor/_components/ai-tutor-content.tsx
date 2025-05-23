"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Book, 
  Brain, 
  Clock, 
  Code, 
  FileText, 
  History,
  Languages, 
  Layout, 
  MessageSquare, 
  Settings,
  Sparkles,
  Target,
  LineChart,
  Library,
  HelpCircle,
  Calendar,
  Network,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "./chat-interface";
import { ResourceLibrary } from "./resource-library";
import { SubjectSelector } from "./subject-selector";
import { LearningStyleSelector } from "./learning-style-selector";
import { SettingsDialog } from "./settings-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuizGenerator } from "./quiz-generator";
import { cn } from "@/lib/utils";
import { StudyScheduler } from "./study-scheduler";
import { NotesManager } from "./notes-manager";
import { GoalSetting } from "./goal-setting";
import { SkillTree } from "./skill-tree";
import { PeerLearning } from "./peer-learning";
import { AIFeedback } from "./ai-feedback";
import { useToast } from "@/components/ui/use-toast";

type View = "chat" | "quiz" | "progress" | "resources" | "schedule" | "notes" | "goals" | "skills" | "peers" | "feedback";

interface NavItem {
  id: View;
  label: string;
  icon: any;
  implemented?: boolean;
}

export const AiTutorContent = () => {
  const [currentView, setCurrentView] = useState<View>("chat");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [learningStyle, setLearningStyle] = useState("visual");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  const navItems: NavItem[] = [
    { id: "chat", label: "AI Chat", icon: MessageSquare, implemented: true },
    { id: "quiz", label: "Practice Quiz", icon: Brain, implemented: false },
    { id: "progress", label: "Progress", icon: LineChart, implemented: false },
    { id: "resources", label: "Resources", icon: Library, implemented: false },
    { id: "schedule", label: "Schedule", icon: Calendar, implemented: false },
    { id: "notes", label: "Notes", icon: FileText, implemented: false },
    { id: "goals", label: "Goals", icon: Target, implemented: false },
    { id: "skills", label: "Skill Tree", icon: Network, implemented: false },
    { id: "peers", label: "Peer Learning", icon: Users, implemented: false },
    { id: "feedback", label: "AI Feedback", icon: Sparkles, implemented: false }
  ];

  const handleViewChange = (view: View) => {
    // Check if the view is implemented
    const navItem = navItems.find(item => item.id === view);
    if (navItem && !navItem.implemented && view !== "chat") {
      toast({
        title: "Coming Soon",
        description: `The ${navItem.label} feature is coming in a future update.`,
        variant: "default"
      });
      return;
    }
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case "peers":
        return <PeerLearning />;
      case "feedback":
        return <AIFeedback />;
      case "skills":
        return <SkillTree />;
      case "goals":
        return <GoalSetting />;
      case "notes":
        return <NotesManager />;
      case "schedule":
        return <StudyScheduler />;
      case "quiz":
        return <QuizGenerator subject={selectedSubject} topic="Selected Topic" />;
      case "chat":
        return <ChatInterface subject={selectedSubject} learningStyle={learningStyle} />;
      case "progress":
        return (
          <div className="text-center py-12">
            <LineChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">Progress tracking coming soon...</p>
          </div>
        );
      case "resources":
        return <ResourceLibrary />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cn(
          "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
          "bg-slate-800/40 backdrop-blur-sm",
          "border border-slate-700/50",
          "p-4 sm:p-6 rounded-xl",
        )}>
          <div>
            <h1 className={cn(
              "text-2xl sm:text-3xl font-bold text-white",
              "bg-gradient-to-r from-purple-400 to-blue-400",
              "text-transparent bg-clip-text"
            )}>
              AI Tutor
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1">
              {selectedSubject 
                ? `Learning ${selectedSubject} with ${learningStyle} style`
                : "Your personalized learning companion powered by AI"}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className={cn(
                "h-9 sm:h-10",
                "border-slate-700",
                "hover:bg-slate-800/50",
                "text-slate-300"
              )}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              size="sm"
              onClick={() => handleViewChange(currentView === "chat" ? "resources" : "chat")}
              className={cn(
                "h-9 sm:h-10",
                "bg-purple-600 hover:bg-purple-700",
                "text-white"
              )}
            >
              {currentView === "chat" ? (
                <>
                  <Library className="w-4 h-4 mr-2" />
                  Resources
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className={cn(
              "bg-slate-800/40 backdrop-blur-sm",
              "border border-slate-700/50",
              "p-4 rounded-xl"
            )}>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    variant={currentView === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      !item.implemented && item.id !== "chat" && "opacity-70"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                    {!item.implemented && item.id !== "chat" && (
                      <span className="ml-auto text-xs bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300">
                        Soon
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Progress */}
            <div className={cn(
              "bg-slate-800/40 backdrop-blur-sm",
              "border border-slate-700/50",
              "rounded-xl p-4",
            )}>
              <h3 className="text-sm font-medium text-white mb-3">
                Learning Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-300">Total Time</p>
                    <p className="text-lg font-semibold text-white">2.5 hrs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-300">Topics Covered</p>
                    <p className="text-lg font-semibold text-white">12</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-300">Achievements</p>
                    <p className="text-lg font-semibold text-white">5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        subject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        learningStyle={learningStyle}
        onLearningStyleChange={setLearningStyle}
      />
    </div>
  );
}; 