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
  const { user, isApproved, isAdmin, isPending, isSuspended } = useAuth();
  const canAccess = isAdmin || (isApproved && !isSuspended);

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

  // Theme styling mapper with ILMORA palette consistency
  const getThemeStyles = (theme?: string) => {
    switch (theme) {
      case 'emerald':
      case 'green':
        return {
          topBorder: 'border-t-2 border-emerald-400',
          iconBg: 'bg-[#033D6B] text-emerald-400 border border-emerald-500/30',
          progressFill: 'bg-emerald-400',
          accentText: 'text-emerald-400',
        };
      default:
        return {
          topBorder: 'border-t-2 border-[#FECF35]',
          iconBg: 'bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/30',
          progressFill: 'bg-[#FECF35]',
          accentText: 'text-[#FECF35]',
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
    <div className="min-h-screen bg-[#022544] text-[#FEFEFE] selection:bg-[#FECF35] selection:text-[#033D6B] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#FEFEFE]/15 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FECF35] mb-2">
              <span>Academic Curriculum</span>
              <span aria-hidden="true" className="text-[#FEFEFE]/40">·</span>
              <span className="text-[#FEFEFE]/80">Independent Chapter Sequences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold tracking-tight text-[#FEFEFE]">
              Subjects & Chapter Hierarchy
            </h1>
            <p className="text-xs sm:text-sm text-[#FEFEFE]/75 mt-1 max-w-2xl font-sans">
              Explore dedicated curricula for Physics, Mathematics, Chemistry, English, Computer Science, and NET Architecture.
            </p>
          </div>

          {/* Global Expand / Collapse Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={expandAllSubjects}
              className="px-3 py-1.5 rounded-lg bg-[#093D6C] hover:bg-[#033D6B] border border-[#FEFEFE]/15 text-xs font-medium text-[#FEFEFE] transition cursor-pointer touch-target"
            >
              Expand all
            </button>
            <button
              onClick={collapseAllSubjects}
              className="px-3 py-1.5 rounded-lg bg-[#093D6C] hover:bg-[#033D6B] border border-[#FEFEFE]/15 text-xs font-medium text-[#FEFEFE] transition cursor-pointer touch-target"
            >
              Collapse all
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
            <PlayCircle className="w-4 h-4 text-[#033D6B]" />
            <span>Resume lecture</span>
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-[#FEFEFE]/45 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, chapters, topics..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl text-xs sm:text-sm text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-1 focus:ring-[#FECF35] focus:border-[#FECF35] transition min-h-[44px]"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-[#FEFEFE]/60 font-medium flex items-center gap-1 px-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Level:</span>
          </span>
          {[
            { id: 'all', label: 'All levels' },
            { id: 'class 12', label: 'Class 12' },
            { id: 'class 11', label: 'Class 11' },
            { id: 'entry test', label: 'NET / Entry Test' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLevel(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer touch-target ${
                selectedLevel === tab.id
                  ? 'bg-[#FECF35] text-[#033D6B] font-semibold shadow-sm'
                  : 'bg-[#093D6C] text-[#FEFEFE]/80 hover:text-[#FEFEFE] border border-[#FEFEFE]/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admission Approval Notice if not yet approved */}
      {user && !canAccess && (
        <div className="bg-[#093D6C] border border-[#FECF35]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm shadow-md">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#FECF35] shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-semibold text-[#FEFEFE]">
                {isSuspended ? 'Account Access Suspended' : 'Admission Approval Required for Lecture Streaming'}
              </p>
              <p className="text-[#FEFEFE]/75 text-xs mt-0.5 leading-relaxed font-sans">
                {isSuspended
                  ? 'Your student account has been suspended by administration. Please contact support to resolve access.'
                  : 'Once your registration is approved by the administrator, video lectures and PDF study notes unlock immediately.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/application-status')}
            className="px-4 py-2 bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium rounded-lg text-xs self-start sm:self-auto cursor-pointer shrink-0 transition touch-target shadow"
          >
            Check status
          </button>
        </div>
      )}

      {/* Subjects Cards List */}
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-16 bg-[#093D6C]/50 rounded-xl border border-[#FEFEFE]/15">
          <Layers className="w-10 h-10 text-[#FEFEFE]/40 mx-auto mb-2" />
          <h3 className="text-base font-heading font-semibold text-[#FEFEFE]">No Subjects Found</h3>
          <p className="text-xs text-[#FEFEFE]/60 mt-1 font-sans">Try adjusting your search query or level filter.</p>
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
                className={`bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl shadow-md transition-all duration-200 overflow-hidden ${theme.topBorder}`}
              >
                {/* Subject Header */}
                <div
                  onClick={() => toggleSubject(subject.id)}
                  className="p-5 sm:p-6 cursor-pointer select-none hover:bg-[#07355c] transition flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                      {renderSubjectIcon(subject.iconName, 'w-5 h-5')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-heading font-semibold text-[#FEFEFE] tracking-tight">
                          {subject.name}
                        </h2>
                        {subject.code && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#033D6B] text-[#FEFEFE]/80 border border-[#FEFEFE]/15">
                            {subject.code}
                          </span>
                        )}
                        <span className="text-xs text-[#FEFEFE]/60">
                          {subject.academicLevel}
                        </span>
                      </div>
                      <p className="text-xs text-[#FEFEFE]/75 mt-1 line-clamp-2 max-w-2xl leading-relaxed font-sans">
                        {subject.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Counts & Progress */}
                  <div className="flex items-center gap-4 sm:gap-6 self-end md:self-auto shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-xs text-[#FEFEFE]/70">
                        <span className="font-medium text-[#FEFEFE]">{stats.totalChapters} chapters</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#FEFEFE]">{stats.totalLectures} lectures</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-24 sm:w-32 h-1.5 rounded-full bg-[#022544] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${theme.progressFill}`}
                            style={{ width: `${stats.percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-semibold text-[#FECF35] min-w-[28px] tabular-nums">
                          {stats.percent}%
                        </span>
                      </div>
                    </div>

                    {/* Expand/Collapse Chevron Button */}
                    <div className="w-8 h-8 rounded-lg bg-[#033D6B] border border-[#FEFEFE]/15 flex items-center justify-center text-[#FEFEFE]/80">
                      {isSubjectExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Subject Chapters Accordion Body */}
                {isSubjectExpanded && (
                  <div className="border-t border-[#FEFEFE]/15 bg-[#033D6B] p-4 sm:p-6 space-y-3">
                    {subjChapters.length === 0 ? (
                      <div className="text-center py-6 text-[#FEFEFE]/50 text-xs font-sans">
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
                            className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl overflow-hidden transition"
                          >
                            {/* Chapter Header */}
                            <div
                              onClick={() => toggleChapter(chapter.id)}
                              className="px-4 py-3 cursor-pointer select-none hover:bg-[#07355c] flex items-center justify-between gap-3 bg-[#093D6C]"
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
                                <span className="w-6 h-6 rounded bg-[#033D6B] text-[#FECF35] text-xs font-semibold flex items-center justify-center border border-[#FEFEFE]/15 shrink-0">
                                  {chapter.chapterNumber}
                                </span>
                                <div className="min-w-0">
                                  <h3 className="text-sm font-heading font-semibold text-[#FEFEFE] tracking-tight flex items-center gap-2 truncate">
                                    <span>{chapter.title}</span>
                                    {totalChapLessons > 0 && completedChapLessons === totalChapLessons && (
                                      <span className="text-[11px] text-emerald-300 font-normal flex items-center gap-0.5">
                                        <Check className="w-3 h-3 text-emerald-300" /> Done
                                      </span>
                                    )}
                                  </h3>
                                  {chapter.description && (
                                    <p className="text-xs text-[#FEFEFE]/70 line-clamp-1 mt-0.5 font-sans">
                                      {chapter.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-[#FEFEFE]/70 font-mono tabular-nums">
                                  {completedChapLessons}/{totalChapLessons} Completed
                                </span>
                                <div className="text-[#FEFEFE]/70">
                                  {isChapterExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Chapter Lectures List */}
                            {isChapterExpanded && (
                              <div className="border-t border-[#FEFEFE]/10 divide-y divide-[#FEFEFE]/10 bg-[#033D6B]/50">
                                {chapterLessons.length === 0 ? (
                                  <div className="p-4 text-xs text-[#FEFEFE]/60 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-[#FECF35] shrink-0" />
                                    <span>Lectures for this chapter are currently in review.</span>
                                  </div>
                                ) : (
                                  chapterLessons.map((lesson) => {
                                    const isDone = completedLessonIds.has(lesson.id);
                                    const hasVideo = Boolean(lesson.videoUrl && lesson.videoUrl.trim() !== '');

                                    return (
                                      <div
                                        key={lesson.id}
                                        className="p-3 sm:p-4 hover:bg-[#093D6C]/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                      >
                                        {/* Lecture info */}
                                        <div className="flex items-start gap-3 min-w-0">
                                          <div className="mt-0.5 shrink-0">
                                            {isDone ? (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                              <div className="w-4 h-4 rounded-full border border-[#FEFEFE]/30 flex items-center justify-center text-[10px] text-[#FEFEFE]/70 font-semibold">
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
                                              className={`text-xs sm:text-sm font-medium transition ${
                                                hasVideo
                                                  ? 'text-[#FEFEFE] hover:text-[#FECF35] cursor-pointer'
                                                  : 'text-[#FEFEFE]/70'
                                              }`}
                                            >
                                              {lesson.title}
                                            </h4>

                                            {/* Clean unboxed metadata with separators */}
                                            <div className="flex items-center gap-2 text-xs text-[#FEFEFE]/60 mt-1 font-sans">
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
                                                    className="text-[#FECF35] hover:underline flex items-center gap-1 font-medium"
                                                  >
                                                    <FileText className="w-3 h-3 text-[#FECF35]" />
                                                    <span>PDF Notes</span>
                                                  </a>
                                                </>
                                              )}
                                            </div>

                                            {lesson.description && (
                                              <p className="text-xs text-[#FEFEFE]/70 mt-1 line-clamp-1 max-w-2xl font-sans">
                                                {lesson.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                          {!hasVideo ? (
                                            <span className="text-[11px] text-[#FEFEFE]/50">
                                              Scheduled
                                            </span>
                                          ) : !canAccess ? (
                                            <button
                                              onClick={() => navigate(user ? '/application-status' : '/register')}
                                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FECF35]/10 text-[#FECF35] border border-[#FECF35]/30 hover:bg-[#FECF35]/20 flex items-center gap-1.5 cursor-pointer transition touch-target"
                                            >
                                              <Lock className="w-3.5 h-3.5 text-[#FECF35]" />
                                              <span>{isPending ? 'Pending approval' : 'Approval required'}</span>
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => navigate(`/learn/${lesson.id}`)}
                                              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition touch-target ${
                                                isDone
                                                  ? 'bg-[#033D6B] text-emerald-300 hover:bg-[#07355c] border border-emerald-500/30'
                                                  : 'bg-[#FECF35] text-[#033D6B] hover:bg-[#ebd02f] shadow-sm'
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
    </div>
  );
};
