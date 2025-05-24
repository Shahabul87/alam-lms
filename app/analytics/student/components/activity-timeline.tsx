"use client";

import { formatDistanceToNow } from "date-fns";
import { Book, PlayCircle, FileText, CheckCircle, Award } from "lucide-react";

interface Activity {
  id: number;
  type: string;
  course: string;
  action: string;
  date: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  // Function to get appropriate icon for activity type
  const getActivityIcon = (type: string) => {
    switch(type) {
      case "course_progress":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "video":
        return <PlayCircle className="h-5 w-5 text-blue-500" />;
      case "reading":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "exam":
        return <Award className="h-5 w-5 text-yellow-500" />;
      default:
        return <Book className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Function to format date as relative time
  const formatActivityDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No recent activity found.
        </div>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                <h3 className="font-medium">
                  {activity.course}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatActivityDate(activity.date)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {activity.action}
              </p>
              <div className="mt-3 border-b border-gray-200 dark:border-gray-800"></div>
            </div>
          </div>
        ))
      )}
      
      {activities.length > 0 && (
        <div className="flex justify-center pt-2">
          <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
} 