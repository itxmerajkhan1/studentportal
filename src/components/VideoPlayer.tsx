import React, { useState, useRef } from 'react';
import { Maximize2, Minimize2, CheckCircle2 } from 'lucide-react';

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

  // Format YouTube Embed URL cleanly without forced autoplay
  const getEmbedUrl = (raw: string) => {
    if (!raw) return 'https://www.youtube.com/embed/gQyqM2wW-gU';
    if (raw.includes('youtube.com/watch?v=')) {
      const vid = raw.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vid}?rel=0`;
    }
    if (raw.includes('youtu.be/')) {
      const vid = raw.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vid}?rel=0`;
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
      {/* Video Frame */}
      <div className="relative aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
        {isDirectVideo ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
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
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>

      {/* Control Bar Below Player */}
      <div className="mt-3 bg-white border border-slate-200/90 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs shadow-xs">
        {/* Speed Controls */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold mr-1 text-[11px]">Speed:</span>
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                  playbackSpeed === s
                    ? 'bg-[#033D6B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsTheater(!isTheater)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer font-medium"
            title="Toggle Theater Mode"
          >
            {isTheater ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isTheater ? 'Default' : 'Theater'}</span>
          </button>
        </div>

        {/* Prev / Complete / Next */}
        <div className="flex items-center gap-2 justify-end">
          {hasPrev && (
            <button
              onClick={onPrevLesson}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
            >
              ← Prev
            </button>
          )}

          {onToggleComplete && (
            <button
              onClick={onToggleComplete}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>
          )}

          {hasNext && (
            <button
              onClick={onNextLesson}
              className="px-4 py-2 rounded-xl bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-bold text-xs transition cursor-pointer shadow-xs"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
