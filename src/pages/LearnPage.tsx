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
  Share2,
  ShieldAlert,
  Clock,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Lock,
  CreditCard,
  ShieldCheck,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'curriculum'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Filter lessons for this course
  const courseLessons = useMemo(() => {
    if (!currentLesson) return [];
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
      await saveLessonProgress(user.uid, currentLesson.courseId, currentLesson.id, newStatus, 0);
      onProgressUpdated({
        userId: user.uid,
        courseId: currentLesson.courseId,
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
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Lecture Not Found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            ← Return to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
      {/* Top Classroom Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(course ? `/courses/${course.id}` : '/courses')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Course</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="truncate max-w-sm sm:max-w-xl">
            <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider block">
              {course?.subject || 'Curriculum'} • {currentLesson.chapterTitle}
            </span>
            <h1 className="text-sm sm:text-base font-bold text-white truncate">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Lecture Playlist"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleComplete}
            disabled={savingProgress}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isCompleted
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{isCompleted ? 'Marked Completed' : 'Mark Complete'}</span>
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
            <div className="w-full aspect-video bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
              <div className="max-w-md space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800">
                    Protected Academic Content
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Annual Membership Required
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Full video lecture streaming and chapter-wise study notes require an active annual student membership.
                  </p>
                </div>

                {membershipStatus === 'pending' ? (
                  <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-xs text-amber-200 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                    <span>Your payment verification is currently in progress (Usually 2–6 hours).</span>
                  </div>
                ) : membershipStatus === 'expired' ? (
                  <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-200">
                    Your previous annual membership has expired. Please renew to resume streaming.
                  </div>
                ) : null}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigate('/membership')}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>View Membership & Activate (Rs. 1,000)</span>
                  </button>
                  <button
                    onClick={() => navigate('/courses')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Back to Catalog
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lecture Breakdown
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Handouts & Notes</span>
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white">{currentLesson.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentLesson.chapterTitle} • Duration: {currentLesson.durationMinutes} Minutes
                    </p>
                  </div>
                  {course && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      Instructor: {course.instructor}
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentLesson.description}
                </div>

                {/* Conceptual points */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Exam Focus & Learning Objectives
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                    <li>Understand fundamental physical definitions and mathematical derivations.</li>
                    <li>Examine board exam past paper problems solved in this session.</li>
                    <li>Review accompanying downloadable formula sheet before attempting self-assessment tests.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Notes */}
            {activeTab === 'notes' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <h3 className="text-sm font-bold text-white">Study Resources & Handouts</h3>
                {currentLesson.pdfNotesUrl ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{currentLesson.title} — Lecture Handout</h4>
                        <p className="text-[11px] text-slate-400">Official instructor notes, key diagrams & solved numericals</p>
                      </div>
                    </div>
                    <a
                      href={currentLesson.pdfNotesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
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
          </div>
        </div>

        {/* Right: Course Playlist Sidebar */}
        <aside
          className={`fixed lg:static top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-800 z-30 transition-transform duration-300 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Course Lectures</h3>
              <p className="text-xs text-cyan-300 font-semibold truncate max-w-[200px]">
                {course?.title || 'Syllabus'}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of Lectures */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {courseLessons.map((l, index) => {
              const active = l.id === lessonId;
              const completed = userProgress.some((p) => p.lessonId === l.id && p.completed);
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    setSidebarOpen(false);
                    navigate(`/learn/${l.id}`);
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer ${
                    active ? 'bg-cyan-950/50 border-l-4 border-cyan-400' : 'hover:bg-slate-850'
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
      </div>
    </div>
  );
};
