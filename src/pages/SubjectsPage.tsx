import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Subject, Chapter, Lesson, LessonProgress } from '../types';
import {
  Atom,
  FlaskConical,
  Calculator,
  BookOpen,
  Cpu,
  Building,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle2,
  Lock,
  FileText,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Layers,
  Video,
  GraduationCap,
  Check,
  AlertCircle,
  ShieldAlert,
  Languages,
} from 'lucide-react';

interface SubjectsPageProps {
  subjects: Subject[];
  chapters: Chapter[];
  lessons: Lesson[];
  userProgress: LessonProgress[];
  navigate: (route: string) => void;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  subjects,
  chapters,
  lessons,
  userProgress,
  navigate,
}) => {
  const { user, isApproved, hasActiveMembership } = useAuth();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Independent accordion state per Subject and per Chapter
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (subjects.length > 0) {
      initial[subjects[0].id] = true;
    }
    return initial;
  });

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (chapters.length > 0) {
      initial[chapters[0].id] = true;
    }
    return initial;
  });

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const expandAllSubjects = () => {
    const next: Record<string, boolean> = {};
    subjects.forEach((s) => {
      next[s.id] = true;
    });
    setExpandedSubjects(next);
  };

  const collapseAllSubjects = () => {
    setExpandedSubjects({});
  };

  // Helper to render icon by name
  const renderSubjectIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName?.toLowerCase()) {
      case 'atom':
        return <Atom className={className} />;
      case 'flaskconical':
      case 'flask':
        return <FlaskConical className={className} />;
      case 'calculator':
        return <Calculator className={className} />;
      case 'bookopen':
      case 'book':
      case 'languages':
        return <Languages className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'building':
        return <Building className={className} />;
      default:
        return <GraduationCap className={className} />;
    }
  };

  // Theme styling mapper
  const getThemeStyles = (theme?: string) => {
    switch (theme) {
      case 'emerald':
      case 'green':
        return {
          topBorder: 'border-t-2 border-emerald-400',
          iconBg: 'bg-emerald-950/70 text-emerald-400 border border-emerald-800',
          progressFill: 'bg-emerald-400',
          accentText: 'text-emerald-400',
        };
      case 'blue':
      case 'sky':
        return {
          topBorder: 'border-t-2 border-sky-400',
          iconBg: 'bg-sky-950/70 text-sky-400 border border-sky-800',
          progressFill: 'bg-sky-400',
          accentText: 'text-sky-400',
        };
      case 'amber':
      case 'yellow':
        return {
          topBorder: 'border-t-2 border-amber-400',
          iconBg: 'bg-amber-950/70 text-amber-400 border border-amber-800',
          progressFill: 'bg-amber-400',
          accentText: 'text-amber-400',
        };
      case 'purple':
      case 'violet':
        return {
          topBorder: 'border-t-2 border-violet-400',
          iconBg: 'bg-violet-950/70 text-violet-400 border border-violet-800',
          progressFill: 'bg-violet-400',
          accentText: 'text-violet-400',
        };
      default:
        return {
          topBorder: 'border-t-2 border-cyan-400',
          iconBg: 'bg-cyan-950/70 text-cyan-400 border border-cyan-800',
          progressFill: 'bg-cyan-400',
          accentText: 'text-cyan-400',
        };
    }
  };

  // Set of completed lesson IDs for fast lookup
  const completedLessonIds = useMemo(() => {
    return new Set(userProgress.filter((p) => p.completed).map((p) => p.lessonId));
  }, [userProgress]);

  // Determine last accessed lesson for Continue Learning banner
  const lastActiveLesson = useMemo(() => {
    if (!user || lessons.length === 0) return null;
    const sortedProgress = [...userProgress].sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });

    if (sortedProgress.length > 0) {
      const match = lessons.find((l) => l.id === sortedProgress[0].lessonId);
      if (match) return match;
    }

    return lessons.find((l) => l.isPublished && Boolean(l.videoUrl)) || null;
  }, [user, lessons, userProgress]);

  // Compute stats per subject
  const subjectStats = useMemo(() => {
    const stats: Record<string, { totalChapters: number; totalLectures: number; completedLectures: number; percent: number }> = {};

    subjects.forEach((subj) => {
      const subjChapters = chapters.filter((c) => c.subjectId === subj.id);
      const subjLessons = lessons.filter(
        (l) => l.subjectId === subj.id || (l.courseId && l.courseId.includes(subj.name.toLowerCase().slice(0, 3)))
      );
      const totalLectures = subjLessons.length;
      const completedLectures = subjLessons.filter((l) => completedLessonIds.has(l.id)).length;
      const percent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

      stats[subj.id] = {
        totalChapters: subjChapters.length,
        totalLectures,
        completedLectures,
        percent,
      };
    });

    return stats;
  }, [subjects, chapters, lessons, completedLessonIds]);

  // Filtered subjects based on level & search
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subj) => {
      if (selectedLevel !== 'all') {
        const matchesLevel = subj.academicLevel.toLowerCase().includes(selectedLevel.toLowerCase());
        if (!matchesLevel) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSubj = subj.name.toLowerCase().includes(q) || subj.description.toLowerCase().includes(q);
        const matchesChap = chapters.some(
          (c) => c.subjectId === subj.id && (c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
        );
        const matchesLes = lessons.some(
          (l) =>
            (l.subjectId === subj.id || (l.courseId && l.courseId.includes(subj.name.toLowerCase().slice(0, 3)))) &&
            (l.title.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q))
        );
        return matchesSubj || matchesChap || matchesLes;
      }
      return true;
    });
  }, [subjects, chapters, lessons, selectedLevel, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
            <span>Academic Curriculum</span>
            <span aria-hidden="true">·</span>
            <span>Independent Chapter Sequences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Subjects & Chapter Hierarchy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Explore dedicated curricula for Physics, Mathematics, Chemistry, English, Computer Science, and NET Architecture.
          </p>
        </div>

        {/* Global Expand / Collapse Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={expandAllSubjects}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition cursor-pointer touch-target"
          >
            Expand All
          </button>
          <button
            onClick={collapseAllSubjects}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition cursor-pointer touch-target"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Continue Learning Resume Card (if student has active lesson) */}
      {user && lastActiveLesson && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-cyan-400 font-semibold">Continue Learning</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{lastActiveLesson.chapterTitle || 'Current Chapter'}</span>
              </div>
              <h3 className="text-sm font-bold text-white truncate mt-0.5">
                {lastActiveLesson.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => navigate(`/learn/${lastActiveLesson.id}`)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 touch-target"
          >
            <PlayCircle className="w-4 h-4 text-slate-950" />
            <span>Resume Lecture</span>
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, chapters, topics..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition min-h-[44px]"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 px-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Level:</span>
          </span>
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'class 12', label: 'Class 12' },
            { id: 'class 11', label: 'Class 11' },
            { id: 'entry test', label: 'NET / Entry Test' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLevel(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer touch-target ${
                selectedLevel === tab.id
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Membership Warning Callout if needed */}
      {user && !hasActiveMembership && (
        <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Annual Membership Required for Protected Lecture Streaming</p>
              <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                Chapter lists and lesson titles are previewable. Activate your annual membership (Rs. 1,000 / year) to stream full HD video lessons and download lecture PDF notes.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/membership')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs self-start sm:self-auto cursor-pointer shrink-0 transition touch-target"
          >
            Activate Membership
          </button>
        </div>
      )}

      {/* Subjects Cards List */}
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No Subjects Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or level filter.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredSubjects.map((subject) => {
            const isSubjectExpanded = Boolean(expandedSubjects[subject.id]);
            const theme = getThemeStyles(subject.colorTheme);
            const stats = subjectStats[subject.id] || { totalChapters: 0, totalLectures: 0, completedLectures: 0, percent: 0 };
            const subjChapters = chapters.filter((c) => c.subjectId === subject.id);

            return (
              <div
                key={subject.id}
                className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-sm transition-all duration-200 overflow-hidden ${theme.topBorder}`}
              >
                {/* Subject Header */}
                <div
                  onClick={() => toggleSubject(subject.id)}
                  className="p-5 sm:p-6 cursor-pointer select-none hover:bg-slate-850/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isSubjectExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSubject(subject.id);
                    }
                  }}
                >
                  {/* Left: Icon & Subject Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                      {renderSubjectIcon(subject.iconName, 'w-5 h-5')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {subject.name}
                        </h2>
                        {subject.code && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {subject.code}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {subject.academicLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-2xl leading-relaxed">
                        {subject.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Counts & Progress */}
                  <div className="flex items-center gap-4 sm:gap-6 self-end md:self-auto shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-200">{stats.totalChapters} Chapters</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-200">{stats.totalLectures} Lectures</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-24 sm:w-32 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${theme.progressFill}`}
                            style={{ width: `${stats.percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-300 min-w-[28px] tabular-nums">
                          {stats.percent}%
                        </span>
                      </div>
                    </div>

                    {/* Expand/Collapse Chevron Button */}
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                      {isSubjectExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Subject Chapters Accordion Body */}
                {isSubjectExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/70 p-4 sm:p-6 space-y-3">
                    {subjChapters.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No chapters configured for this subject yet.
                      </div>
                    ) : (
                      subjChapters.map((chapter) => {
                        const isChapterExpanded = Boolean(expandedChapters[chapter.id]);
                        const chapterLessons = lessons
                          .filter(
                            (l) =>
                              l.chapterId === chapter.id ||
                              (l.chapterTitle && l.chapterTitle.toLowerCase().includes(chapter.title.toLowerCase().slice(0, 15))) ||
                              (!l.chapterId && l.subjectId === subject.id && l.chapterTitle?.includes(`Chapter ${chapter.chapterNumber}`))
                          )
                          .sort((a, b) => a.order - b.order);

                        const totalChapLessons = chapterLessons.length;
                        const completedChapLessons = chapterLessons.filter((l) =>
                          completedLessonIds.has(l.id)
                        ).length;

                        return (
                          <div
                            key={chapter.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition"
                          >
                            {/* Chapter Header */}
                            <div
                              onClick={() => toggleChapter(chapter.id)}
                              className="px-4 py-3 cursor-pointer select-none hover:bg-slate-850 flex items-center justify-between gap-3 bg-slate-900/90"
                              role="button"
                              tabIndex={0}
                              aria-expanded={isChapterExpanded}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleChapter(chapter.id);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-700 shrink-0">
                                  {chapter.chapterNumber}
                                </span>
                                <div className="min-w-0">
                                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 truncate">
                                    <span>{chapter.title}</span>
                                    {totalChapLessons > 0 && completedChapLessons === totalChapLessons && (
                                      <span className="text-[11px] text-emerald-400 font-normal flex items-center gap-0.5">
                                        <Check className="w-3 h-3 text-emerald-400" /> Done
                                      </span>
                                    )}
                                  </h3>
                                  {chapter.description && (
                                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                      {chapter.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-slate-400 font-mono tabular-nums">
                                  {completedChapLessons}/{totalChapLessons} Completed
                                </span>
                                <div className="text-slate-400">
                                  {isChapterExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Chapter Lectures List */}
                            {isChapterExpanded && (
                              <div className="border-t border-slate-800 divide-y divide-slate-800/60 bg-slate-950/40">
                                {chapterLessons.length === 0 ? (
                                  <div className="p-4 text-xs text-slate-400 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                                    <span>Lectures for this chapter are currently in review.</span>
                                  </div>
                                ) : (
                                  chapterLessons.map((lesson) => {
                                    const isDone = completedLessonIds.has(lesson.id);
                                    const hasVideo = Boolean(lesson.videoUrl && lesson.videoUrl.trim() !== '');

                                    return (
                                      <div
                                        key={lesson.id}
                                        className="p-3 sm:p-4 hover:bg-slate-900/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                      >
                                        {/* Lecture info */}
                                        <div className="flex items-start gap-3 min-w-0">
                                          <div className="mt-0.5 shrink-0">
                                            {isDone ? (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                              <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                                                {lesson.order}
                                              </div>
                                            )}
                                          </div>

                                          <div className="min-w-0">
                                            <h4
                                              onClick={() => {
                                                if (hasVideo) {
                                                  navigate(`/learn/${lesson.id}`);
                                                }
                                              }}
                                              className={`text-xs sm:text-sm font-semibold transition ${
                                                hasVideo
                                                  ? 'text-white hover:text-cyan-400 cursor-pointer'
                                                  : 'text-slate-300'
                                              }`}
                                            >
                                              {lesson.title}
                                            </h4>

                                            {/* Clean unboxed metadata with separators */}
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                              {lesson.durationMinutes > 0 && (
                                                <span>{lesson.durationMinutes} mins</span>
                                              )}
                                              {lesson.pdfNotesUrl && (
                                                <>
                                                  <span aria-hidden="true">·</span>
                                                  <a
                                                    href={lesson.pdfNotesUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                                                  >
                                                    <FileText className="w-3 h-3 text-cyan-400" />
                                                    <span>PDF Notes</span>
                                                  </a>
                                                </>
                                              )}
                                            </div>

                                            {lesson.description && (
                                              <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-2xl">
                                                {lesson.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                          {!hasVideo ? (
                                            <span className="text-[11px] text-slate-500">
                                              Scheduled
                                            </span>
                                          ) : !hasActiveMembership ? (
                                            <button
                                              onClick={() => navigate('/membership')}
                                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-500/30 hover:bg-amber-400/20 flex items-center gap-1.5 cursor-pointer transition touch-target"
                                            >
                                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                                              <span>Unlock</span>
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => navigate(`/learn/${lesson.id}`)}
                                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition touch-target ${
                                                isDone
                                                  ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/30'
                                                  : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-sm'
                                              }`}
                                            >
                                              <Video className="w-3.5 h-3.5" />
                                              <span>{isDone ? 'Replay' : 'Watch'}</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
