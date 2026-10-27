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
  Eye,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'playlist'>('overview');
  const [mobilePlaylistOpen, setMobilePlaylistOpen] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Single trusted video streaming access rule:
  // Approved students (not suspended/rejected) or administrators can stream all videos.
  // Video access does NOT require a paid membership!
  const canStreamVideo = isAdmin || (isApproved && !isSuspended && !isRejected);

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
      <div className="min-h-screen bg-[#022544] text-[#FEFEFE] flex items-center justify-center p-6 selection:bg-[#FECF35] selection:text-[#033D6B]">
        <div className="text-center space-y-4 max-w-sm">
          <BookOpen className="w-10 h-10 text-[#FEFEFE]/40 mx-auto" />
          <h2 className="text-xl font-heading font-semibold text-[#FEFEFE]">Lecture Not Found</h2>
          <p className="text-xs text-[#FEFEFE]/70 font-sans">The requested lecture does not exist or has been moved.</p>
          <button
            onClick={() => navigate('/subjects')}
            className="px-4 py-2 rounded-lg bg-[#FECF35] text-[#033D6B] font-medium text-xs hover:bg-[#ebd02f] transition shadow"
          >
            ← Back to subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#022544] text-[#FEFEFE] min-h-screen flex flex-col selection:bg-[#FECF35] selection:text-[#033D6B]">
      {/* Top Classroom Bar */}
      <div className="bg-[#033D6B] border-b border-[#FEFEFE]/15 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => navigate('/subjects')}
            className="flex items-center gap-1.5 text-xs text-[#FEFEFE]/75 hover:text-[#FECF35] font-medium transition cursor-pointer shrink-0 touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Subjects</span>
          </button>
          <div className="h-4 w-px bg-[#FEFEFE]/15 shrink-0" />
          <div className="min-w-0 truncate">
            <span className="text-[10px] text-[#FECF35] font-semibold uppercase tracking-wider block truncate">
              {course?.subject || 'Curriculum'} • {currentLesson.chapterTitle || 'Chapter'}
            </span>
            <h1 className="text-xs sm:text-sm md:text-base font-heading font-semibold text-[#FEFEFE] truncate">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setMobilePlaylistOpen(!mobilePlaylistOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#093D6C] text-[#FEFEFE] hover:text-[#FECF35] border border-[#FEFEFE]/15 flex items-center gap-1.5 text-xs font-medium touch-target"
            aria-label="Toggle Lecture Playlist"
          >
            <Layers className="w-4 h-4 text-[#FECF35]" />
            <span className="hidden xs:inline">Lectures</span>
          </button>

          <button
            onClick={handleToggleComplete}
            disabled={savingProgress}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer touch-target ${
              isCompleted
                ? 'bg-[#093D6C] text-emerald-300 border border-emerald-500/40'
                : 'bg-[#093D6C] hover:bg-[#07355c] text-[#FEFEFE] border border-[#FEFEFE]/15'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-[#FEFEFE]/60'}`} />
            <span>{isCompleted ? 'Completed' : 'Mark complete'}</span>
          </button>
        </div>
      </div>

      {/* Main Classroom Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: Video Player & Lecture Notes Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Video Player or Approval Required Notice */}
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
            <div className="w-full aspect-video bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
              <div className="max-w-md space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#033D6B] border border-[#FECF35]/30 flex items-center justify-center text-[#FECF35] mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#033D6B] bg-[#FECF35] px-2.5 py-0.5 rounded">
                    Administrator Approval Required
                  </span>
                  <h2 className="text-xl sm:text-2xl font-heading font-semibold text-[#FEFEFE]">
                    {isSuspended ? 'Account Suspended' : isRejected ? 'Admission Rejected' : 'Admission Approval Pending'}
                  </h2>
                  <p className="text-xs text-[#FEFEFE]/75 leading-relaxed font-sans">
                    {isSuspended
                      ? 'Your student account access has been suspended. Please contact portal administration at itxmirajkhan@gmail.com.'
                      : isRejected
                      ? 'Your admission application was not approved. Please contact administration for further details.'
                      : 'Your admission is currently under review by our administration. Once approved by the administrator, all full HD video lectures and PDF handouts unlock automatically.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigate('/application-status')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-xs shadow transition cursor-pointer flex items-center justify-center gap-2 touch-target"
                  >
                    <span>Check application status</span>
                  </button>
                  <button
                    onClick={() => navigate('/subjects')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#033D6B] hover:bg-[#07355c] text-[#FEFEFE] text-xs font-medium border border-[#FEFEFE]/15 touch-target cursor-pointer"
                  >
                    Back to curriculum
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lecture Info Tabs */}
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center gap-2 border-b border-[#FEFEFE]/15 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer touch-target ${
                  activeTab === 'overview'
                    ? 'bg-[#FECF35] text-[#033D6B] font-semibold shadow-sm'
                    : 'text-[#FEFEFE]/75 hover:text-[#FEFEFE]'
                }`}
              >
                Lecture Breakdown
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 touch-target ${
                  activeTab === 'notes'
                    ? 'bg-[#FECF35] text-[#033D6B] font-semibold shadow-sm'
                    : 'text-[#FEFEFE]/75 hover:text-[#FEFEFE]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Handouts & Notes</span>
              </button>
              <button
                onClick={() => setActiveTab('playlist')}
                className={`lg:hidden px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 touch-target ${
                  activeTab === 'playlist'
                    ? 'bg-[#FECF35] text-[#033D6B] font-semibold shadow-sm'
                    : 'text-[#FEFEFE]/75 hover:text-[#FEFEFE]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Chapter Lectures</span>
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-5 sm:p-6 space-y-4 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-heading font-semibold text-[#FEFEFE]">{currentLesson.title}</h2>
                    <p className="text-xs text-[#FEFEFE]/70 mt-0.5 font-sans">
                      {currentLesson.chapterTitle} • Duration: {currentLesson.durationMinutes} Minutes
                    </p>
                  </div>
                  {course && (
                    <span className="text-xs text-[#FEFEFE]/75">
                      Instructor: <strong className="text-[#FECF35] font-medium">{course.instructor}</strong>
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-[#FEFEFE]/85 leading-relaxed whitespace-pre-line font-sans">
                  {currentLesson.description}
                </div>

                {/* Conceptual points */}
                <div className="p-4 bg-[#033D6B] border border-[#FEFEFE]/15 rounded-lg space-y-2 text-xs">
                  <h3 className="font-heading font-semibold text-[#FECF35]">Board Exam Preparation Objectives</h3>
                  <ul className="list-disc list-inside space-y-1 text-[#FEFEFE]/80 text-xs font-sans">
                    <li>Master fundamental physical definitions and mathematical derivations.</li>
                    <li>Examine solved past paper problems from Punjab and Federal examination boards.</li>
                    <li>Download formula summary sheets prior to attempting practice questions.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Notes */}
            {activeTab === 'notes' && (
              <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-5 sm:p-6 space-y-4 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-[#FEFEFE]/10">
                  <div>
                    <h2 className="text-sm font-heading font-semibold text-[#FEFEFE]">Study Resources & Downloadable Handouts</h2>
                    <p className="text-xs text-[#FEFEFE]/70 font-sans">Chapter notes, solved numericals, and board formulas</p>
                  </div>
                  {currentLesson.pdfNotesUrl && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/30">
                      PDF Available
                    </span>
                  )}
                </div>

                {currentLesson.pdfNotesUrl ? (
                  <div className="p-4 rounded-xl bg-[#033D6B] border border-[#FEFEFE]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 rounded-lg bg-[#093D6C] text-[#FECF35] border border-[#FEFEFE]/15 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-[#FEFEFE] truncate">
                          {currentLesson.pdfFileName || `${currentLesson.title} — Lecture Notes.pdf`}
                        </h3>
                        <p className="text-[11px] text-[#FEFEFE]/70 font-sans">
                          {currentLesson.pdfFileSize
                            ? `${(currentLesson.pdfFileSize / (1024 * 1024)).toFixed(2)} MB • `
                            : ''}
                          Official instructor derivations & chapter notes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={currentLesson.pdfNotesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-lg bg-[#093D6C] hover:bg-[#07355c] text-[#FEFEFE] font-medium text-xs transition border border-[#FEFEFE]/15 touch-target flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#FECF35]" />
                        <span>View PDF</span>
                      </a>
                      <a
                        href={currentLesson.pdfNotesUrl}
                        download={currentLesson.pdfFileName || `${currentLesson.title}_notes.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-xs flex items-center justify-center gap-1.5 transition touch-target shadow cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#033D6B]" />
                        <span>Download PDF Notes</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[#FEFEFE]/60 space-y-2 font-sans">
                    <FileText className="w-8 h-8 text-[#FEFEFE]/30 mx-auto" />
                    <p>No PDF notes attached for this lecture yet. Follow the comprehensive on-screen derivations.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Mobile Inline Playlist */}
            {activeTab === 'playlist' && (
              <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl overflow-hidden shadow-md divide-y divide-[#FEFEFE]/10">
                <div className="p-4 bg-[#033D6B] font-semibold text-xs text-[#FEFEFE]">
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
                        active ? 'bg-[#033D6B]' : 'hover:bg-[#07355c]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                              active ? 'bg-[#FECF35] text-[#033D6B]' : 'bg-[#033D6B] text-[#FEFEFE]/70'
                            }`}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium leading-tight truncate ${active ? 'text-[#FECF35]' : 'text-[#FEFEFE]'}`}>
                          {l.title}
                        </p>
                        <p className="text-[10px] text-[#FEFEFE]/60 mt-0.5 font-sans">{l.durationMinutes} mins</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Desktop Sidebar: Course Playlist */}
        <aside className="hidden lg:flex flex-col w-80 bg-[#093D6C] border-l border-[#FEFEFE]/15 shrink-0">
          <div className="p-4 border-b border-[#FEFEFE]/10">
            <h2 className="text-xs uppercase font-semibold text-[#FEFEFE]/70 tracking-wider">Chapter Lectures</h2>
            <p className="text-xs text-[#FECF35] font-semibold truncate max-w-[240px] mt-0.5">
              {currentLesson.chapterTitle || course?.title || 'Curriculum Sequence'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#FEFEFE]/10">
            {courseLessons.map((l, index) => {
              const active = l.id === lessonId;
              const completed = userProgress.some((p) => p.lessonId === l.id && p.completed);
              return (
                <button
                  key={l.id}
                  onClick={() => navigate(`/learn/${l.id}`)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer ${
                    active ? 'bg-[#033D6B]' : 'hover:bg-[#07355c]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                          active ? 'bg-[#FECF35] text-[#033D6B]' : 'bg-[#033D6B] text-[#FEFEFE]/70'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-tight line-clamp-2 ${
                        active ? 'text-[#FECF35]' : 'text-[#FEFEFE]'
                      }`}
                    >
                      {l.title}
                    </p>
                    <p className="text-[10px] text-[#FEFEFE]/60 mt-1 font-sans">
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
          <div className="lg:hidden fixed inset-0 z-50 bg-[#022544]/80 backdrop-blur-sm flex justify-end">
            <div className="w-80 max-w-[85vw] h-full bg-[#093D6C] border-l border-[#FEFEFE]/15 flex flex-col shadow-2xl animate-fade-in">
              <div className="p-4 border-b border-[#FEFEFE]/10 flex items-center justify-between">
                <div>
                  <h2 className="text-xs uppercase font-semibold text-[#FEFEFE]/70 tracking-wider">Chapter Playlist</h2>
                  <p className="text-xs text-[#FECF35] font-semibold truncate max-w-[180px]">
                    {currentLesson.chapterTitle || 'Lectures'}
                  </p>
                </div>
                <button
                  onClick={() => setMobilePlaylistOpen(false)}
                  className="p-2 rounded-lg text-[#FEFEFE]/70 hover:text-[#FEFEFE] touch-target"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#FEFEFE]/10">
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
                        active ? 'bg-[#033D6B]' : 'hover:bg-[#07355c]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                              active ? 'bg-[#FECF35] text-[#033D6B]' : 'bg-[#033D6B] text-[#FEFEFE]/70'
                            }`}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-tight line-clamp-2 ${active ? 'text-[#FECF35]' : 'text-[#FEFEFE]'}`}>
                          {l.title}
                        </p>
                        <p className="text-[10px] text-[#FEFEFE]/60 mt-1 font-sans">{l.durationMinutes} mins</p>
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
