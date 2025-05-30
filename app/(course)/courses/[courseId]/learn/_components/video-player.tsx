"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Maximize, Minimize } from "lucide-react";
import YouTube from "react-youtube";
import type { YouTubeEvent } from 'react-youtube';

interface VideoPlayerProps {
  videoUrl: string;
  courseId: string;
  chapterId: string;
  sectionId: string;
}

export const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (videoUrl) {
      const extractVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
      };

      const id = extractVideoId(videoUrl);
      setVideoId(id);
    }
  }, [videoUrl]);

  const getPlayerSize = () => {
    if (isFullscreen) {
      return {
        height: '100vh',
        width: '100vw'
      };
    }
    return {
      height: '100%',
      width: '100%',
    };
  };

  const opts = {
    ...getPlayerSize(),
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      controls: 1,
      fs: 1,
      playsinline: 1,
    },
  };

  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.error("YouTube Player Error:", error);
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">No video available</p>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full aspect-video'}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        </div>
      )}
      <div className={`${isFullscreen ? 'h-full w-full' : 'relative aspect-video'}`}>
        <YouTube
          videoId={videoId}
          opts={opts}
          className={`${isFullscreen ? 'h-full w-full' : 'absolute top-0 left-0 w-full h-full'}`}
          onReady={handleReady}
          onError={handleError}
          iframeClassName="w-full h-full rounded-lg"
        />
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
        >
          {isFullscreen ? (
            <Minimize className="h-5 w-5 text-white" />
          ) : (
            <Maximize className="h-5 w-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}; 