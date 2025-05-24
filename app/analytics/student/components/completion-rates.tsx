"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Video, BookOpen, FileText, Award } from "lucide-react";

interface CompletionRatesProps {
  rates: {
    videos: number;
    readings: number;
    exercises: number;
    exams: number;
  };
}

export function CompletionRates({ rates }: CompletionRatesProps) {
  const getProgressColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 70) return "bg-blue-500";
    if (rate >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCompletionStatus = (rate: number) => {
    if (rate >= 90) return "Excellent";
    if (rate >= 70) return "Good";
    if (rate >= 50) return "Average";
    return "Needs Improvement";
  };

  // Calculate overall completion rate
  const overallRate = Math.round(
    (rates.videos + rates.readings + rates.exercises + rates.exams) / 4
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Content Completion Rates</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Your consumption rate for different types of learning content
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-lg font-medium">Overall Completion</h3>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={overallRate} className="h-2 flex-1" />
              <span className="text-sm font-medium w-[40px] text-right">
                {overallRate}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {getCompletionStatus(overallRate)} completion rate across all content types
            </p>
          </Card>
        </div>

        <CompletionRateItem 
          icon={<Video className="h-5 w-5" />}
          label="Videos" 
          rate={rates.videos} 
          color={getProgressColor(rates.videos)}
          status={getCompletionStatus(rates.videos)}
        />
        
        <CompletionRateItem 
          icon={<BookOpen className="h-5 w-5" />}
          label="Readings" 
          rate={rates.readings} 
          color={getProgressColor(rates.readings)}
          status={getCompletionStatus(rates.readings)}
        />
        
        <CompletionRateItem 
          icon={<FileText className="h-5 w-5" />}
          label="Exercises" 
          rate={rates.exercises} 
          color={getProgressColor(rates.exercises)}
          status={getCompletionStatus(rates.exercises)}
        />
        
        <CompletionRateItem 
          icon={<Award className="h-5 w-5" />}
          label="Exams" 
          rate={rates.exams} 
          color={getProgressColor(rates.exams)}
          status={getCompletionStatus(rates.exams)}
        />
      </div>
    </Card>
  );
}

interface CompletionRateItemProps {
  icon: React.ReactNode;
  label: string;
  rate: number;
  color: string;
  status: string;
}

function CompletionRateItem({ icon, label, rate, color, status }: CompletionRateItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-medium">
            {rate}%
          </span>
        </div>
        <Progress value={rate} className={`h-2 ${color}`} />
      </div>
      <div className="hidden md:block w-[100px] text-right">
        <span className="text-sm text-gray-500 dark:text-gray-400">{status}</span>
      </div>
    </div>
  );
} 