import React, { useMemo } from 'react';
import { Course, Lesson, LessonProgress, Announcement } from '../types';
import { useAuth } from '../context/AuthContext';
import { computeCourseProgress } from '../utils/portalLogic';
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Bell,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Layers,
  CreditCard,
  Lock,
  Atom,
  Binary,
  FlaskConical,
  Cpu,
  Building,
  User,
} from 'lucide-react';

interface DashboardPageProps {
  courses: Course[];
  lessons: Lesson[];
  userProgress: LessonProgress[];
  announcements: Announcement[];
  navigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  courses,
  lessons,
  userProgress,
  announcements,
  navigate,
}) => {
  const { user, profile, isAdmin, isApproved, isPending, hasActiveMembership, membershipDaysRemaining } = useAuth();

  // If student is not approved or pending
  if (!isAdmin && !isApproved) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Review In Progress
            </span>
            <h2 className="text-xl font-heading font-bold text-slate-900 pt-1">Admission Awaiting Approval</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans pt-1">
              Your registration is currently under review by the portal administrator. Once verified, full HD video streaming will unlock automatically.
            </p>
          </div>
          <button
            onClick={() => navigate('/application-status')}
            className="w-full py-3 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition shadow cursor-pointer touch-target"
          >
            Check Application Status
          </button>
        </div>
      </div>
    );
  }

  const publishedCourses = useMemo(() => {
    return courses.filter((c) => c.isPublished);
  }, [courses]);

  const completedLessonIdSet = useMemo(() => {
    return new Set(userProgress.filter((p) => p.completed).map((p) => p.lessonId));
  }, [userProgress]);

  // Genuine "Continue Watching" calculation
  const continueWatching = useMemo(() => {
    if (publishedCourses.length === 0 || lessons.length === 0) return null;

    // Strict filter for user progress that has started watching or explicitly updated
    const sortedProgress = [...userProgress]
      .filter((p) => !p.completed && (p.lastWatchedSeconds || 0) > 0)
      .sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      });

    if (sortedProgress.length > 0) {
      const match = lessons.find((l) => l.id === sortedProgress[0].lessonId);
      if (match) {
        const c = publishedCourses.find((pc) => pc.id === match.courseId) || publishedCourses[0];
        return { course: c, lesson: match, progress: sortedProgress[0] };
      }
    }

    return null;
  }, [publishedCourses, lessons, userProgress]);

  // Subject progress breakdown
  const subjectProgressList = useMemo(() => {
    const subjects = [
      { name: 'Physics', icon: <Atom className="w-4 h-4 text-[#033D6B]" />, key: 'phy' },
      { name: 'Mathematics', icon: <Binary className="w-4 h-4 text-[#033D6B]" />, key: 'math' },
      { name: 'Chemistry', icon: <FlaskConical className="w-4 h-4 text-[#033D6B]" />, key: 'chem' },
      { name: 'Computer Science', icon: <Cpu className="w-4 h-4 text-[#033D6B]" />, key: 'cs' },
    ];

    return subjects.map((subj) => {
      const subjLessons = lessons.filter(
        (l) => (l.subjectId && l.subjectId.includes(subj.key)) || (l.courseId && l.courseId.includes(subj.key))
      );
      const total = subjLessons.length || 12;
      const completed = subjLessons.filter((l) => completedLessonIdSet.has(l.id)).length;
      const percent = Math.min(100, Math.round((completed / total) * 100));
      return {
        ...subj,
        total,
        completed,
        percent,
      };
    });
  }, [lessons, completedLessonIdSet]);

  const totalCompletedLessons = completedLessonIdSet.size;

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen py-6 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Greeting Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-[#033D6B]">
              <Sparkles className="w-3.5 h-3.5 text-[#033D6B]" />
              <span>Academic Session 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
              Welcome back, {profile?.fullName || user?.email?.split('@')[0] || 'Student'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Track your FSc board exam & entry test preparation progress.
            </p>
          </div>

          {/* Quick Profile Summary Badge */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#033D6B] text-[#FECF35] font-bold text-sm flex items-center justify-center shadow-xs">
              {profile?.fullName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-900 truncate max-w-[150px]">
                {profile?.fullName || 'Authorized Student'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {profile?.academicLevel || 'Class 12 • FSc'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Completed Lectures</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-mono text-slate-900">{totalCompletedLessons}</p>
            <p className="text-[11px] text-slate-500">Lessons finished across courses</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Available Courses</span>
              <div className="p-2 rounded-xl bg-slate-100 text-[#033D6B]">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-mono text-slate-900">{publishedCourses.length}</p>
            <p className="text-[11px] text-slate-500">Video courses published</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Lectures</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <PlayCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-mono text-slate-900">{lessons.length}</p>
            <p className="text-[11px] text-slate-500">Video lectures in database</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Membership Status</span>
              <div className="p-2 rounded-xl bg-cyan-50 text-[#033D6B]">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-base font-bold text-slate-900 truncate">
              {hasActiveMembership ? 'Active Member' : 'Annual Pass Needed'}
            </p>
            <p className="text-[11px] text-slate-500">
              {hasActiveMembership ? `${membershipDaysRemaining} days remaining` : 'Click to activate pass'}
            </p>
          </div>
        </div>

        {/* Continue Watching Section (Only rendered if student has started a lecture) */}
        {continueWatching && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#033D6B]" />
                <h2 className="text-base font-heading font-bold text-slate-900">Continue Watching</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Unfinished Lecture</span>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#033D6B] text-[#FECF35] flex items-center justify-center shrink-0 border border-slate-700">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="text-[11px] font-semibold text-[#FECF35] tracking-wide block truncate">
                    {continueWatching.course.subject} • {continueWatching.lesson.chapterTitle}
                  </span>
                  <h3 className="text-sm sm:text-base font-heading font-bold text-white truncate">
                    {continueWatching.lesson.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">
                    Duration: {continueWatching.lesson.durationMinutes} mins • Faculty: {continueWatching.course.instructor}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/learn/${continueWatching.lesson.id}`)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition cursor-pointer flex items-center justify-center gap-2 shrink-0 touch-target shadow"
              >
                <PlayCircle className="w-4 h-4 text-[#033D6B]" />
                <span>Resume Lecture</span>
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Grid: My Courses vs Notices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Subject-Wise Progress & Courses */}
          <div className="lg:col-span-8 space-y-6">
            {/* Subject-Wise Progress Strip */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-heading font-bold text-slate-900">Subject-Wise Progress</h2>
                <button
                  onClick={() => navigate('/subjects')}
                  className="text-xs font-semibold text-[#033D6B] hover:underline flex items-center gap-1"
                >
                  <span>Curriculum details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjectProgressList.map((sp) => (
                  <div key={sp.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {sp.icon}
                        <span className="text-xs font-bold text-slate-900">{sp.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#033D6B]">{sp.percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#033D6B] rounded-full transition-all duration-300" style={{ width: `${sp.percent}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">{sp.completed} of {sp.total} lessons finished</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses List */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-heading font-bold text-slate-900">My Registered Courses</h2>
                <button
                  onClick={() => navigate('/courses')}
                  className="text-xs font-semibold text-[#033D6B] hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {publishedCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {publishedCourses.map((c) => {
                    const courseLessonIds = lessons.filter((l) => l.courseId === c.id).map((l) => l.id);
                    const completedLessonIds = userProgress.filter((p) => p.courseId === c.id && p.completed).map((p) => p.lessonId);
                    const cProgress = computeCourseProgress(courseLessonIds, completedLessonIds);
                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#033D6B] text-white px-2 py-0.5 rounded-md">
                              {c.subject}
                            </span>
                            <span className="text-xs font-mono text-slate-500">{cProgress.percentage}%</span>
                          </div>
                          <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">{c.title}</h3>
                          <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-mono">
                            {cProgress.completedCount}/{cProgress.totalCount} lessons
                          </span>
                          <button
                            onClick={() => navigate(`/courses/${c.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition cursor-pointer shadow-xs"
                          >
                            Open Course
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  No published courses found. Contact admin if you need course access.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Notices / Portal Circulars */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#033D6B]" />
                  <h2 className="text-base font-heading font-bold text-slate-900">Notice Board</h2>
                </div>
                <button
                  onClick={() => navigate('/announcements')}
                  className="text-xs font-semibold text-[#033D6B] hover:underline"
                >
                  All
                </button>
              </div>

              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 hover:bg-slate-100/80 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#033D6B]">
                          {a.priority === 'urgent' ? '🚨 Board Alert' : 'Portal Circular'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900">{a.title}</h3>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{a.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No active circulars published.</p>
              )}
            </div>

            {/* Quick Support Card */}
            <div className="bg-[#0F172A] text-white rounded-3xl p-6 space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-[#FECF35]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-heading font-bold text-sm text-white">Student Helpline & Support</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Need help with membership activation, video playback, or admission approval? Contact our academic team directly.
              </p>
              <div className="pt-1 text-xs font-mono text-slate-300 space-y-1">
                <p>WhatsApp: <span className="text-[#FECF35] font-bold">+92 321 2812203</span></p>
                <p>Email: <span className="text-white font-bold">itxmirajkhan@gmail.com</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
