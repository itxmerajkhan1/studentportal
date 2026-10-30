import React, { useState, useEffect, useMemo } from 'react';
import { Course, Lesson, LessonProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveLessonProgress } from '../firebase/config';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Lock,
  Layers,
  Clock,
  PlayCircle,
  X,
} from 'lucide-react';

interface LearnPageProps {
  lessonId: string;
  courses: Course[];
  lessons: Lesson[];
  userProgress: LessonProgress[];
  onProgressUpdated: (progress: LessonProgress) => void;
  navigate: (route: string) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  lessonId,
  courses,
  lessons,
  userProgress,
  onProgressUpdated,
  navigate,
}) => {
  const { user, isApproved, isAdmin, isPending, isSuspended, isRejected } = useAuth();
  const [mobilePlaylistOpen, setMobilePlaylistOpen] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Video streaming access rule: Approved students or administrators
  const canStreamVideo = isAdmin || (isApproved && !isSuspended && !isRejected);

  useEffect(() => {
    if (!isAdmin && !isApproved) {
      if (isPending) {
        navigate('/application-status');
      } else {
        navigate('/register');
      }
    }
  }, [isAdmin, isApproved, isPending, navigate]);

  const currentLesson = lessons.find((l) => l.id === lessonId);
  const course = currentLesson ? courses.find((c) => c.id === currentLesson.courseId) : null;

  // Filter lessons for playlist
  const courseLessons = useMemo(() => {
    if (!currentLesson) return [];
    if (currentLesson.chapterId) {
      const inChapter = lessons
        .filter((l) => l.chapterId === currentLesson.chapterId && (l.isPublished || isAdmin))
        .sort((a, b) => a.order - b.order);
      if (inChapter.length > 0) return inChapter;
    }
    return lessons
      .filter((l) => l.courseId === currentLesson.courseId && (l.isPublished || isAdmin))
      .sort((a, b) => a.order - b.order);
  }, [lessons, currentLesson, isAdmin]);

  const currentProgress = userProgress.find((p) => p.lessonId === lessonId);
  const isCompleted = !!currentProgress?.completed;

  // Previous & Next Lesson
  const currentIndex = courseLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

  const handleToggleComplete = async () => {
    if (!user || !currentLesson) return;
    setSavingProgress(true);
    try {
      const newStatus = !isCompleted;
      await saveLessonProgress(
        user.uid,
        currentLesson.courseId || '',
        currentLesson.id,
        newStatus,
        0,
        currentLesson.subjectId,
        currentLesson.chapterId
      );
      onProgressUpdated({
        userId: user.uid,
        courseId: currentLesson.courseId || '',
        subjectId: currentLesson.subjectId,
        chapterId: currentLesson.chapterId,
        lessonId: currentLesson.id,
        completed: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to update lesson progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-xl font-heading font-bold text-slate-900">Lecture Not Found</h2>
          <p className="text-xs text-slate-600 font-sans">The requested lecture does not exist or has been moved.</p>
          <button
            onClick={() => navigate('/subjects')}
            className="px-4 py-2 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs shadow"
          >
            ← Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col selection:bg-[#FECF35] selection:text-[#033D6B]">
      {/* Top Classroom Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => navigate('/subjects')}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#033D6B] font-semibold transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Subjects</span>
          </button>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <div className="min-w-0 truncate">
            <span className="text-[10px] text-[#033D6B] font-bold uppercase tracking-wider block truncate">
              {course?.subject || 'Curriculum'} • {currentLesson.chapterTitle || 'Chapter'}
            </span>
            <h1 className="text-xs sm:text-sm md:text-base font-heading font-bold text-slate-900 truncate">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMobilePlaylistOpen(!mobilePlaylistOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5 text-xs font-semibold"
          >
            <Layers className="w-4 h-4 text-[#033D6B]" />
            <span className="hidden xs:inline">Lectures</span>
          </button>

          <button
            onClick={handleToggleComplete}
            disabled={savingProgress}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* Main Classroom Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Main Video & Details Panel */}
        <div className="flex-1 space-y-6 overflow-y-auto">
          {canStreamVideo ? (
            <VideoPlayer
              videoUrl={currentLesson.videoUrl}
              videoProvider={currentLesson.videoProvider || 'youtube'}
              title={currentLesson.title}
              isCompleted={isCompleted}
              onToggleComplete={handleToggleComplete}
              onPrevLesson={prevLesson ? () => navigate(`/learn/${prevLesson.id}`) : undefined}
              onNextLesson={nextLesson ? () => navigate(`/learn/${nextLesson.id}`) : undefined}
              hasPrev={!!prevLesson}
              hasNext={!!nextLesson}
            />
          ) : (
            <div className="w-full aspect-video bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-md">
              <div className="max-w-md space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Approval Required
                  </span>
                  <h2 className="text-xl font-heading font-bold text-slate-900">
                    {isSuspended ? 'Account Suspended' : isRejected ? 'Admission Rejected' : 'Admission Review Pending'}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Full HD video streaming unlocks automatically once verified by portal administration.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/application-status')}
                  className="px-5 py-2.5 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs shadow"
                >
                  Check Application Status
                </button>
              </div>
            </div>
          )}

          {/* Lecture Summary & Info Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-xs">
            <h2 className="text-base font-heading font-bold text-slate-900">Lecture Summary & Key Concepts</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {currentLesson.description || 'Watch the video lecture for detailed board derivations, past paper solving, and conceptual explanations.'}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-500 border-t border-slate-100">
              <span>Chapter: {currentLesson.chapterTitle || 'General'}</span>
              <span>·</span>
              <span>Duration: {currentLesson.durationMinutes} minutes</span>
            </div>
          </div>
        </div>

        {/* Playlist Side Panel */}
        <aside
          className={`lg:w-80 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col space-y-4 shrink-0 ${
            mobilePlaylistOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#033D6B]" />
              <h3 className="font-heading font-bold text-sm text-slate-900">Chapter Playlist</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{courseLessons.length} Lectures</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {courseLessons.map((lec, idx) => {
              const isCurrent = lec.id === lessonId;
              const isDone = userProgress.some((p) => p.lessonId === lec.id && p.completed);

              return (
                <button
                  key={lec.id}
                  onClick={() => navigate(`/learn/${lec.id}`)}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#033D6B] text-white border-[#033D6B] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-200/80'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      isCurrent
                        ? 'bg-[#FECF35] text-[#033D6B]'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                      {lec.title}
                    </p>
                    <p className={`text-[10px] font-mono ${isCurrent ? 'text-slate-200' : 'text-slate-400'}`}>
                      {lec.durationMinutes} mins
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
