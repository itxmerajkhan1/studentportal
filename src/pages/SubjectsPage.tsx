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
  Clock,
  ArrowRight,
  Search,
  Filter,
  Layers,
  Video,
  GraduationCap,
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
  const { user, isApproved, isAdmin, isSuspended } = useAuth();
  const canAccess = isAdmin || (isApproved && !isSuspended);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Independent accordion state per Subject
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (subjects.length > 0) {
      initial[subjects[0].id] = true;
    }
    return initial;
  });

  // Independent accordion state per Chapter
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

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

  const completedLessonIds = useMemo(() => {
    return new Set(userProgress.filter((p) => p.completed).map((p) => p.lessonId));
  }, [userProgress]);

  // Determine last accessed lesson ONLY if student has real progress
  const lastActiveLesson = useMemo(() => {
    if (!user || lessons.length === 0) return null;
    const sortedProgress = [...userProgress]
      .filter((p) => !p.completed && (p.lastWatchedSeconds || 0) > 0)
      .sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      });

    if (sortedProgress.length > 0) {
      const match = lessons.find((l) => l.id === sortedProgress[0].lessonId);
      if (match) return match;
    }

    return null;
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

  // Filter subjects based on search & level
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel =
        selectedLevel === 'all' ||
        s.academicLevel.toLowerCase().includes(selectedLevel.toLowerCase());

      return matchesSearch && matchesLevel;
    });
  }, [subjects, searchQuery, selectedLevel]);

  const renderSubjectIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-5 h-5 text-[#033D6B]" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5 text-[#033D6B]" />;
      case 'Calculator':
      case 'Binary':
        return <Calculator className="w-5 h-5 text-[#033D6B]" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-[#033D6B]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-[#033D6B]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#033D6B]" />;
    }
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-[#033D6B]">
              <Layers className="w-3.5 h-3.5 text-[#033D6B]" />
              <span>Academic Curriculum</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
              Subjects & Chapter-wise Video Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Comprehensive conceptual video lectures for Class 11, Class 12, and Entry Test preparation.
            </p>
          </div>

          {/* Quick Search & Level Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#033D6B]/20"
              />
            </div>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="class 11">Class 11 (FSc Part 1)</option>
              <option value="class 12">Class 12 (FSc Part 2)</option>
              <option value="mdcat">MDCAT / ECAT</option>
            </select>
          </div>
        </div>

        {/* Continue Learning Resume Banner (Only if student has started a lecture) */}
        {lastActiveLesson && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#033D6B] text-[#FECF35] flex items-center justify-center shrink-0 border border-slate-800">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <span className="text-[11px] font-semibold text-[#FECF35] uppercase tracking-wider block truncate">
                  Resume Unfinished Lecture
                </span>
                <h3 className="text-sm sm:text-base font-heading font-bold text-white truncate">
                  {lastActiveLesson.title}
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  {lastActiveLesson.chapterTitle} • Duration: {lastActiveLesson.durationMinutes} mins
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/learn/${lastActiveLesson.id}`)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition cursor-pointer flex items-center justify-center gap-2 shrink-0 touch-target shadow"
            >
              <PlayCircle className="w-4 h-4 text-[#033D6B]" />
              <span>Resume Video</span>
            </button>
          </div>
        )}

        {/* Subjects Accordion List */}
        <div className="space-y-6">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subj) => {
              const isSubjOpen = !!expandedSubjects[subj.id];
              const stats = subjectStats[subj.id] || { totalChapters: 0, totalLectures: 0, completedLectures: 0, percent: 0 };
              const subjChapters = chapters.filter((c) => c.subjectId === subj.id);

              return (
                <div
                  key={subj.id}
                  className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs space-y-0"
                >
                  {/* Subject Accordion Header */}
                  <div
                    onClick={() => toggleSubject(subj.id)}
                    className="p-6 cursor-pointer hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#033D6B] flex items-center justify-center shrink-0">
                        {renderSubjectIcon(subj.iconName)}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-heading font-bold text-slate-900">{subj.name}</h2>
                          <span className="text-[11px] font-semibold text-[#033D6B] bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {subj.academicLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-sans line-clamp-1">{subj.description}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono pt-0.5">
                          <span>{stats.totalChapters} Chapters</span>
                          <span>·</span>
                          <span>{stats.totalLectures} Video Lectures</span>
                          <span>·</span>
                          <span>{stats.completedLectures} Completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                      <div className="w-24 text-right space-y-1">
                        <span className="text-xs font-mono font-bold text-[#033D6B]">{stats.percent}%</span>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#033D6B] rounded-full transition-all duration-300" style={{ width: `${stats.percent}%` }} />
                        </div>
                      </div>
                      <button className="p-2 rounded-full text-slate-400 hover:text-slate-900">
                        {isSubjOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Chapters Body */}
                  {isSubjOpen && (
                    <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-4">
                      {subjChapters.length > 0 ? (
                        subjChapters.map((chap) => {
                          const isChapOpen = expandedChapters[chap.id] ?? true; // Default open chapters
                          const chapLessons = lessons
                            .filter((l) => l.chapterId === chap.id || l.chapterTitle === chap.title)
                            .sort((a, b) => a.order - b.order);

                          return (
                            <div key={chap.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
                              {/* Chapter Header */}
                              <div
                                onClick={() => toggleChapter(chap.id)}
                                className="flex items-center justify-between cursor-pointer select-none"
                              >
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#033D6B]">
                                    Chapter {chap.chapterNumber || 1}
                                  </span>
                                  <h3 className="text-sm font-heading font-bold text-slate-900">{chap.title}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>{chapLessons.length} Lectures</span>
                                  {isChapOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>

                              {/* Chapter Lectures List */}
                              {isChapOpen && (
                                <div className="pt-2 divide-y divide-slate-100">
                                  {chapLessons.length > 0 ? (
                                    chapLessons.map((lec) => {
                                      const isDone = completedLessonIds.has(lec.id);

                                      return (
                                        <div
                                          key={lec.id}
                                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
                                        >
                                          <div className="flex items-start gap-3 min-w-0">
                                            <div
                                              className={`p-2 rounded-xl shrink-0 ${
                                                isDone
                                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                  : 'bg-slate-100 text-[#033D6B]'
                                              }`}
                                            >
                                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="min-w-0">
                                              <p className="text-xs font-bold text-slate-900 truncate">{lec.title}</p>
                                              <p className="text-[11px] text-slate-500 font-sans line-clamp-1">
                                                {lec.description || `Chapter video lecture (${lec.durationMinutes} mins)`}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                                            <span className="text-[11px] font-mono text-slate-400">
                                              {lec.durationMinutes} mins
                                            </span>

                                            {canAccess ? (
                                              <button
                                                onClick={() => navigate(`/learn/${lec.id}`)}
                                                className="px-3.5 py-1.5 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition cursor-pointer shadow-xs flex items-center gap-1.5"
                                              >
                                                <PlayCircle className="w-3.5 h-3.5 text-[#033D6B]" />
                                                <span>Watch Lecture</span>
                                              </button>
                                            ) : (
                                              <button
                                                onClick={() => navigate('/application-status')}
                                                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium flex items-center gap-1 cursor-pointer"
                                              >
                                                <Lock className="w-3.5 h-3.5" />
                                                <span>Approval Needed</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="text-xs text-slate-500 py-3 text-center font-sans">
                                      Lectures scheduled in production for this chapter.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-500 text-center py-4">No chapters created for this subject yet.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-xs">
              No subjects found matching "{searchQuery}". Try clearing search filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
