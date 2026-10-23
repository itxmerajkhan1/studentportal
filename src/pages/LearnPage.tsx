import React, { useState, useEffect, useMemo } from 'react';
import { Course, Lesson, LessonProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveLessonProgress } from '../firebase/config';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  BookOpen,
  Download,
  Lock,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  Menu,
  X,
  PlayCircle,
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
  const { user, isApproved, isAdmin, isPending, hasActiveMembership, membershipStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'playlist'>('overview');
  const [mobilePlaylistOpen, setMobilePlaylistOpen] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // If student is not authorized to stream, redirect
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

  // Filter lessons for playlist: group by chapter or subject if available
  const courseLessons = useMemo(() => {
    if (!currentLesson) return [];
    if (currentLesson.chapterId) {
      const inChapter = lessons
        .filter((l) => l.chapterId === currentLesson.chapterId && (l.isPublished || isAdmin))
        .sort((a, b) => a.order - b.order);
      if (inChapter.length > 0) return inChapter;
    }
    if (currentLesson.subjectId) {
      const inSubject = lessons
        .filter((l) => l.subjectId === currentLesson.subjectId && (l.isPublished || isAdmin))
        .sort((a, b) => a.order - b.order);
      if (inSubject.length > 0) return inSubject;
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold">Lecture Not Found</h2>
          <p className="text-xs text-slate-400">The requested lecture does not exist or has been moved.</p>
          <button
            onClick={() => navigate('/subjects')}
            className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            ← Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
      {/* Top Classroom Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => navigate('/subjects')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition cursor-pointer shrink-0 touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Subjects</span>
          </button>
          <div className="h-4 w-px bg-slate-800 shrink-0" />
          <div className="min-w-0 truncate">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block truncate">
              {course?.subject || 'Curriculum'} • {currentLesson.chapterTitle || 'Chapter'}
            </span>
            <h1 className="text-xs sm:text-sm md:text-base font-bold text-white truncate">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setMobilePlaylistOpen(!mobilePlaylistOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold touch-target"
            aria-label="Toggle Lecture Playlist"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden xs:inline">Lectures</span>
          </button>

          <button
            onClick={handleToggleComplete}
            disabled={savingProgress}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer touch-target ${
              isCompleted
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* Main Classroom Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: Video Player & Lecture Notes Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Video Player or Membership Required Protection */}
          {hasActiveMembership ? (
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
            <div className="w-full aspect-video bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
              <div className="max-w-md space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800">
                    Protected Academic Content
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Annual Membership Required
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Full lecture streaming and PDF notes require an active annual membership pass (Rs. 1,000 / year).
                  </p>
                </div>

                {membershipStatus === 'pending' ? (
                  <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-xs text-amber-200 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                    <span>Your payment verification is in progress (usually 2–6 hours).</span>
                  </div>
                ) : null}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigate('/membership')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 touch-target"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Activate Membership (Rs. 1,000)</span>
                  </button>
                  <button
                    onClick={() => navigate('/subjects')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold touch-target"
                  >
                    Back to Subjects
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lecture Info Tabs */}
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer touch-target ${
                  activeTab === 'overview'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lecture Breakdown
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 touch-target ${
                  activeTab === 'notes'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Handouts & Notes</span>
              </button>
              <button
                onClick={() => setActiveTab('playlist')}
                className={`lg:hidden px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 touch-target ${
                  activeTab === 'playlist'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Chapter Lectures</span>
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">{currentLesson.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentLesson.chapterTitle} • Duration: {currentLesson.durationMinutes} Minutes
                    </p>
                  </div>
                  {course && (
                    <span className="text-xs text-slate-400">
                      Instructor: <strong className="text-slate-200">{course.instructor}</strong>
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentLesson.description}
                </div>

                {/* Conceptual points */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <h3 className="font-bold text-cyan-400">Board Exam Preparation Objectives</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                    <li>Master fundamental physical definitions and mathematical derivations.</li>
                    <li>Examine solved past paper problems from Punjab and Federal examination boards.</li>
                    <li>Download formula summary sheets prior to attempting practice questions.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Notes */}
            {activeTab === 'notes' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-white">Study Resources & Downloadable Handouts</h2>
                {currentLesson.pdfNotesUrl ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white truncate">{currentLesson.title} — Lecture Notes</h3>
                        <p className="text-[11px] text-slate-400">Official instructor notes, key derivations & solved numericals</p>
                      </div>
                    </div>
                    <a
                      href={currentLesson.pdfNotesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 touch-target"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-950" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                    <p>No external PDF attached for this lecture. Follow the on-screen textbook derivations.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Mobile Inline Playlist */}
            {activeTab === 'playlist' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-800">
                <div className="p-4 bg-slate-950/60 font-bold text-xs text-slate-300">
                  Chapter Lectures ({courseLessons.length})
                </div>
                {courseLessons.map((l, index) => {
                  const active = l.id === lessonId;
                  const completed = userProgress.some((p) => p.lessonId === l.id && p.completed);
                  return (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/learn/${l.id}`)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer ${
                        active ? 'bg-cyan-950/60' : 'hover:bg-slate-850'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              active ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold leading-tight truncate ${active ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {l.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{l.durationMinutes} mins</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Desktop Sidebar: Course Playlist */}
        <aside className="hidden lg:flex flex-col w-80 bg-slate-900 border-l border-slate-800 shrink-0">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Chapter Lectures</h2>
            <p className="text-xs text-cyan-300 font-semibold truncate max-w-[240px] mt-0.5">
              {currentLesson.chapterTitle || course?.title || 'Curriculum Sequence'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {courseLessons.map((l, index) => {
              const active = l.id === lessonId;
              const completed = userProgress.some((p) => p.lessonId === l.id && p.completed);
              return (
                <button
                  key={l.id}
                  onClick={() => navigate(`/learn/${l.id}`)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer ${
                    active ? 'bg-cyan-950/50' : 'hover:bg-slate-850'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          active ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold leading-tight line-clamp-2 ${
                        active ? 'text-cyan-300' : 'text-slate-200'
                      }`}
                    >
                      {l.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {l.durationMinutes} mins
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile Flyout Drawer for Playlist */}
        {mobilePlaylistOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
            <div className="w-80 max-w-[85vw] h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-fade-in">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Chapter Playlist</h2>
                  <p className="text-xs text-cyan-300 font-semibold truncate max-w-[180px]">
                    {currentLesson.chapterTitle || 'Lectures'}
                  </p>
                </div>
                <button
                  onClick={() => setMobilePlaylistOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white touch-target"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
                {courseLessons.map((l, index) => {
                  const active = l.id === lessonId;
                  const completed = userProgress.some((p) => p.lessonId === l.id && p.completed);
                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        setMobilePlaylistOpen(false);
                        navigate(`/learn/${l.id}`);
                      }}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer touch-target ${
                        active ? 'bg-cyan-950/60' : 'hover:bg-slate-850'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              active ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-tight line-clamp-2 ${active ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {l.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{l.durationMinutes} mins</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
