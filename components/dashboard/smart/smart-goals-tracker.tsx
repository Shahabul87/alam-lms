"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  Brain,
  Calendar,
  Flag,
  Zap,
  Star,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface SmartGoalsTrackerProps {
  goals: any[];
  milestones: any[];
  aiRecommendedGoals: any[];
}

export default function SmartGoalsTracker({ 
  goals, 
  milestones, 
  aiRecommendedGoals 
}: SmartGoalsTrackerProps) {
  // Mock goals if none provided
  const mockGoals = [
    {
      id: "1",
      title: "Complete React Mastery Course",
      description: "Finish all modules and projects",
      category: "LEARNING",
      status: "IN_PROGRESS",
      progress: 75,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      milestones: [
        { title: "Complete Hooks Module", completed: true },
        { title: "Build Todo App", completed: true },
        { title: "Advanced Patterns", completed: false },
        { title: "Final Project", completed: false }
      ]
    },
    {
      id: "2",
      title: "Publish 10 Blog Posts",
      description: "Share knowledge through writing",
      category: "CONTENT_CREATION",
      status: "IN_PROGRESS",
      progress: 60,
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      milestones: [
        { title: "Research Topics", completed: true },
        { title: "Write 5 Posts", completed: true },
        { title: "Write 5 More Posts", completed: false },
        { title: "Promote Content", completed: false }
      ]
    },
    {
      id: "3",
      title: "Build Network of 100 Connections",
      description: "Connect with industry professionals",
      category: "NETWORKING",
      status: "IN_PROGRESS",
      progress: 45,
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      milestones: [
        { title: "Set up LinkedIn", completed: true },
        { title: "Connect with 25 people", completed: false },
        { title: "Connect with 50 people", completed: false },
        { title: "Connect with 100 people", completed: false }
      ]
    }
  ];

  const mockAIRecommendedGoals = [
    {
      id: "ai-1",
      title: "Learn TypeScript",
      description: "Based on your React progress",
      estimatedDuration: "3 weeks",
      difficulty: "Intermediate",
      reason: "Complements your React skills and is trending in job market"
    },
    {
      id: "ai-2", 
      title: "Contribute to Open Source",
      description: "Enhance your GitHub profile",
      estimatedDuration: "Ongoing",
      difficulty: "Beginner",
      reason: "Great way to practice skills and build professional network"
    }
  ];

  const displayGoals = goals?.length > 0 ? goals : mockGoals;
  const displayAIGoals = aiRecommendedGoals?.length > 0 ? aiRecommendedGoals : mockAIRecommendedGoals;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'LEARNING':
        return Target;
      case 'CONTENT_CREATION':
        return Star;
      case 'NETWORKING':
        return TrendingUp;
      case 'CAREER':
        return Flag;
      default:
        return Target;
    }
  };

  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
              <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Smart Goals Tracker</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track and achieve your learning objectives
              </p>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Goals */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Active Goals</h4>
          
          {displayGoals.filter(goal => goal.status !== 'COMPLETED').slice(0, 3).map((goal, index) => {
            const Icon = getCategoryIcon(goal.category);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-orange-100 dark:bg-orange-900/50 rounded">
                        <Icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {goal.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(goal.status)}>
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {goal.progress}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <CheckCircle className="h-3 w-3" />
                        <span>
                          {goal.milestones?.filter((m: any) => m.completed).length || 0}/
                          {goal.milestones?.length || 0} milestones
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AI Recommended Goals */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">AI Recommended Goals</h4>
          </div>
          
          <div className="space-y-3">
            {displayAIGoals.slice(0, 2).map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {goal.title}
                      </h5>
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {goal.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {goal.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{goal.estimatedDuration}</span>
                      </div>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-2">
                      <p className="text-xs text-purple-700 dark:text-purple-400">
                        <strong>Why AI suggests this:</strong> {goal.reason}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs ml-3">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Goal
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {displayGoals.filter(g => g.status === 'COMPLETED').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {displayGoals.filter(g => g.status === 'IN_PROGRESS').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {Math.round(displayGoals.reduce((acc, goal) => acc + goal.progress, 0) / displayGoals.length) || 0}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Progress</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 