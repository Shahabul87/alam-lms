import { useState } from "react";
import { Play, Clock, Eye, Grid3X3, List, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoContentProps {
  videos: Array<{
    id: string;
    title: string;
    description?: string | null;
    url: string;
    duration?: number | null;
    thumbnail?: string | null;
    views?: number;
  }>;
}

export const VideoContent = ({ videos }: VideoContentProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views?: number) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleVideoClick = (url: string, title: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Play className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          No Videos Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Video content will appear here when available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Video Lessons ({videos.length})
        </h3>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
            <Play className="w-3 h-3 mr-1" />
            Videos
          </Badge>
        </div>
      </div>

      {/* Video Grid/List */}
      <div className={cn(
        viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "grid gap-4"
      )}>
        {videos.map((video, index) => (
          <Card 
            key={video.id} 
            className="group hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 cursor-pointer"
            onClick={() => handleVideoClick(video.url, video.title)}
          >
            <CardContent className="p-0">
              {viewMode === "grid" ? (
                /* Grid View */
                <div className="space-y-3">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video">
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-t-lg overflow-hidden">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-slate-700 dark:text-slate-300 ml-0.5" />
                        </div>
                      </div>
                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                      {/* External Link Icon */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center">
                          <ExternalLink className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4 pt-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {video.title}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        #{index + 1}
                      </span>
                    </div>
                    
                    {video.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {video.description}
                      </p>
                    )}

                    {/* Video Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      {video.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                      )}
                      {video.views !== undefined && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatViews(video.views)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="flex gap-4 p-4">
                  {/* Video Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg overflow-hidden">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-slate-700 dark:text-slate-300 ml-0.5" />
                        </div>
                      </div>
                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors flex items-center gap-2">
                        {video.title}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        Video {index + 1}
                      </span>
                    </div>
                    
                    {video.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {video.description}
                      </p>
                    )}

                    {/* Video Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      {video.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                      )}
                      {video.views !== undefined && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatViews(video.views)} views</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 