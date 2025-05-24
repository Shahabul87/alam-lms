"use client";

import { Card } from "@/components/ui/card";
import { SunMedium, Sunset, Moon, SunDim } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TimeDistributionProps {
  distribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export function TimeDistribution({ distribution }: TimeDistributionProps) {
  const totalPercentage = 
    distribution.morning + 
    distribution.afternoon + 
    distribution.evening + 
    distribution.night;
    
  // Normalize to 100% if not already
  const normalizedDistribution = totalPercentage !== 100 ? {
    morning: Math.round((distribution.morning / totalPercentage) * 100),
    afternoon: Math.round((distribution.afternoon / totalPercentage) * 100),
    evening: Math.round((distribution.evening / totalPercentage) * 100),
    night: Math.round((distribution.night / totalPercentage) * 100)
  } : distribution;
  
  // Determine peak learning time
  const peakTime = Object.entries(normalizedDistribution).reduce(
    (peak, [time, percentage]) => 
      percentage > peak.percentage ? { time, percentage } : peak,
    { time: '', percentage: 0 }
  );
  
  const getPeakDescription = (time: string) => {
    switch (time) {
      case 'morning': return "You're an early bird who learns best in the morning.";
      case 'afternoon': return "Afternoon is your most productive learning time.";
      case 'evening': return "You prefer learning in the evening hours.";
      case 'night': return "You're a night owl with peak learning during late hours.";
      default: return "Your learning pattern varies throughout the day.";
    }
  };
  
  // Style variations based on time of day
  const timeStyles = {
    morning: { 
      icon: <SunMedium className="h-5 w-5 text-yellow-500" />,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-500"
    },
    afternoon: { 
      icon: <SunDim className="h-5 w-5 text-orange-500" />,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500"
    },
    evening: { 
      icon: <Sunset className="h-5 w-5 text-purple-500" />,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500"
    },
    night: { 
      icon: <Moon className="h-5 w-5 text-blue-500" />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500"
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Learning Time Distribution</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          When you're most active with your learning activities
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-medium mb-2">Peak Learning Time</h3>
          <div className="flex items-center gap-2">
            {timeStyles[peakTime.time as keyof typeof timeStyles].icon}
            <span className={`font-medium ${timeStyles[peakTime.time as keyof typeof timeStyles].color}`}>
              {peakTime.time.charAt(0).toUpperCase() + peakTime.time.slice(1)} ({peakTime.percentage}%)
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {getPeakDescription(peakTime.time)}
          </p>
        </div>
        
        <div className="space-y-5">
          <TimeDistributionItem 
            label="Morning (6am - 12pm)" 
            icon={timeStyles.morning.icon}
            percentage={normalizedDistribution.morning} 
            color={timeStyles.morning.bg}
          />
          
          <TimeDistributionItem 
            label="Afternoon (12pm - 5pm)" 
            icon={timeStyles.afternoon.icon}
            percentage={normalizedDistribution.afternoon} 
            color={timeStyles.afternoon.bg}
          />
          
          <TimeDistributionItem 
            label="Evening (5pm - 10pm)" 
            icon={timeStyles.evening.icon}
            percentage={normalizedDistribution.evening} 
            color={timeStyles.evening.bg}
          />
          
          <TimeDistributionItem 
            label="Night (10pm - 6am)" 
            icon={timeStyles.night.icon}
            percentage={normalizedDistribution.night} 
            color={timeStyles.night.bg}
          />
        </div>
      </div>
    </Card>
  );
}

interface TimeDistributionItemProps {
  label: string;
  icon: React.ReactNode;
  percentage: number;
  color: string;
}

function TimeDistributionItem({ label, icon, percentage, color }: TimeDistributionItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
        <Progress value={percentage} className={`h-2 ${color}`} />
      </div>
    </div>
  );
} 