import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  videoProvider?: 'youtube' | 'vimeo' | 'direct' | 'storage';
  title: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  videoProvider = 'youtube',
  title,
  isCompleted = false,
  onToggleComplete,
  onNextLesson,
  onPrevLesson,
  hasNext = false,
  hasPrev = false,
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Format YouTube Embed URL if raw watch link is supplied
  const getEmbedUrl = (raw: string) => {
    if (!raw) return 'https://www.youtube.com/embed/gQyqM2wW-gU';
    if (raw.includes('youtube.com/watch?v=')) {
      const vid = raw.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`;
    }
    if (raw.includes('youtu.be/')) {
      const vid = raw.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`;
    }
    if (raw.includes('youtube.com/embed/')) {
      return raw.includes('?') ? `${raw}&rel=0` : `${raw}?rel=0`;
    }
    return raw;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const isDirectVideo =
    videoProvider === 'direct' ||
    videoUrl.endsWith('.mp4') ||
    videoUrl.endsWith('.webm') ||
    videoUrl.includes('firebasestorage');

  return (
    <div className={`transition-all duration-300 ${isTheater ? 'w-full' : 'max-w-5xl mx-auto'}`}>
      {/* Video Container Frame */}
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        {isDirectVideo ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-contain"
            onEnded={() => {
              if (onToggleComplete && !isCompleted) {
                onToggleComplete();
              }
            }}
          />
        ) : (
          <iframe
            src={getEmbedUrl(videoUrl)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}

        {/* Live Watermark / Brand Badge */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-cyan-300 border border-slate-700/60 pointer-events-none select-none flex items-center gap-1.5 shadow-md">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Meraj Lecture Stream</span>
        </div>
      </div>

      {/* Control Bar Below Player */}
      <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-slate-300 text-xs shadow-md">
        {/* Navigation & Speed controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
            <span className="text-slate-400 font-medium mr-1">Speed:</span>
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                  playbackSpeed === s
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsTheater(!isTheater)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Toggle Theater Mode"
          >
            {isTheater ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isTheater ? 'Default View' : 'Theater'}</span>
          </button>
        </div>

        {/* Completion & Prev/Next Actions */}
        <div className="flex items-center gap-2">
          {hasPrev && (
            <button
              onClick={onPrevLesson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
            >
              ← Previous Lecture
            </button>
          )}

          {onToggleComplete && (
            <button
              onClick={onToggleComplete}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer shadow-sm ${
                isCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
              <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
            </button>
          )}

          {hasNext && (
            <button
              onClick={onNextLesson}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer shadow-md shadow-cyan-500/20"
            >
              Next Lecture →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
