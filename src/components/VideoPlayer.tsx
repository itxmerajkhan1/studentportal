import React, { useState, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
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
      {/* Video Container Frame: True 16:9 */}
      <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        {isDirectVideo ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            playsInline
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
      </div>

      {/* Control Bar Below Player */}
      <div className="mt-3 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-slate-300 text-xs shadow-sm">
        {/* Playback speed & theater view */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Speed:</span>
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold transition cursor-pointer touch-target flex items-center justify-center ${
                  playbackSpeed === s
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsTheater(!isTheater)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Toggle Theater Mode"
          >
            {isTheater ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isTheater ? 'Default' : 'Theater'}</span>
          </button>
        </div>

        {/* Completion & Prev/Next Actions */}
        <div className="flex items-center gap-2 justify-end">
          {hasPrev && (
            <button
              onClick={onPrevLesson}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer touch-target"
            >
              ← Prev
            </button>
          )}

          {onToggleComplete && (
            <button
              onClick={onToggleComplete}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition cursor-pointer shadow-sm touch-target ${
                isCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>
          )}

          {hasNext && (
            <button
              onClick={onNextLesson}
              className="px-3 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm touch-target"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
