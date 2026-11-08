import React, { useState } from 'react';
import { Upload, Video, CheckCircle, AlertCircle, Trash2, Loader2, Link } from 'lucide-react';
import { uploadLectureVideo, deleteLectureVideo } from '../firebase/config';

interface VideoUploadFieldProps {
  lessonId?: string;
  videoUrl: string;
  videoProvider?: 'youtube' | 'vimeo' | 'direct' | 'storage';
  videoStoragePath?: string;
  videoFileName?: string;
  onVideoChange: (data: {
    videoUrl: string;
    videoProvider: 'youtube' | 'vimeo' | 'direct' | 'storage';
    videoStoragePath?: string;
    videoFileName?: string;
    videoFileSize?: number | null;
  }) => void;
}

export const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  lessonId,
  videoUrl,
  videoProvider = 'youtube',
  videoStoragePath = '',
  videoFileName = '',
  onVideoChange,
}) => {
  const [activeMode, setActiveMode] = useState<'url' | 'upload'>(videoStoragePath ? 'upload' : 'url');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploading(true);
    setProgress(0);

    try {
      const res = await uploadLectureVideo(file, lessonId || 'lec', (percent) => {
        setProgress(percent);
      });

      onVideoChange({
        videoUrl: res.downloadUrl,
        videoProvider: 'storage',
        videoStoragePath: res.storagePath,
        videoFileName: res.fileName,
        videoFileSize: res.fileSize,
      });
      setActiveMode('upload');
    } catch (err: unknown) {
      console.error('Video upload error:', err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Video upload failed. Please verify file format and size (max 500 MB).'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveUploadedVideo = async () => {
    if (!confirm('Are you sure you want to delete this uploaded video file from Storage?')) return;
    try {
      if (videoStoragePath) {
        await deleteLectureVideo(videoStoragePath);
      }
    } catch {
      // Ignore cleanup error
    }
    onVideoChange({
      videoUrl: '',
      videoProvider: 'youtube',
      videoStoragePath: '',
      videoFileName: '',
      videoFileSize: null,
    });
    setActiveMode('url');
  };

  return (
    <div className="space-y-2.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <label className="block font-semibold text-slate-300 text-xs">Video Source</label>
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
              activeMode === 'url' ? 'bg-[#033D6B] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3 h-3" />
            <span>URL / YouTube</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
              activeMode === 'upload' ? 'bg-[#033D6B] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload MP4</span>
          </button>
        </div>
      </div>

      {activeMode === 'url' ? (
        <div className="space-y-1.5">
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
            value={videoUrl || ''}
            onChange={(e) => {
              const val = e.target.value;
              let prov: 'youtube' | 'vimeo' | 'direct' | 'storage' = 'youtube';
              if (val.includes('vimeo.com')) prov = 'vimeo';
              else if (val.endsWith('.mp4') || val.endsWith('.webm') || val.includes('firebasestorage')) prov = 'direct';
              onVideoChange({
                videoUrl: val,
                videoProvider: prov,
                videoStoragePath: '',
                videoFileName: '',
                videoFileSize: null,
              });
            }}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
          />
          <p className="text-[10px] text-slate-500">
            Paste a YouTube URL, Vimeo link, or direct MP4 video link.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {videoStoragePath && videoUrl ? (
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-emerald-500/30 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-emerald-300 truncate">{videoFileName || 'Uploaded Video File'}</p>
                  <p className="text-[10px] text-slate-400">Firebase Storage Asset</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveUploadedVideo}
                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition cursor-pointer ml-2"
                title="Remove video file"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-4 text-center transition bg-slate-900/50">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
                onChange={handleFileSelect}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center gap-1.5">
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    <p className="text-xs font-semibold text-slate-300">Uploading Video ({progress}%)...</p>
                    <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Video className="w-6 h-6 text-slate-400" />
                    <p className="text-xs font-medium text-slate-200">
                      Click or drag MP4 / WebM video file here
                    </p>
                    <p className="text-[10px] text-slate-500">Max size 500 MB · Uploads to Firebase Storage</p>
                  </>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-2 bg-rose-950/60 border border-rose-800/80 rounded-xl text-[11px] text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
