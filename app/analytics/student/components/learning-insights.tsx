"use client";

import { Card } from "@/components/ui/card";
import { Lightbulb, TrendingUp, BrainCircuit } from "lucide-react";

interface LearningInsightsProps {
  insights: string[];
}

export function LearningInsights({ insights }: LearningInsightsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
          <BrainCircuit className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Smart Learning Insights</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Personalized insights and recommendations based on your learning patterns
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-medium mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          Recommended Actions
        </h3>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="rounded-full h-1.5 w-1.5 bg-blue-500 mt-1.5"></span>
            <span className="text-sm">Focus on completing Machine Learning Basics course</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="rounded-full h-1.5 w-1.5 bg-blue-500 mt-1.5"></span>
            <span className="text-sm">Increase time spent on practical exercises in Python</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="rounded-full h-1.5 w-1.5 bg-blue-500 mt-1.5"></span>
            <span className="text-sm">Review AWS fundamentals before progressing to advanced topics</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="rounded-full h-1.5 w-1.5 bg-blue-500 mt-1.5"></span>
            <span className="text-sm">Join study groups for data science to enhance collaborative learning</span>
          </li>
        </ul>
      </div>
    </Card>
  );
}

interface InsightCardProps {
  insight: string;
}

function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
      <p className="text-sm">{insight}</p>
    </div>
  );
} 