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
  const { user, profile, isAdmin, isApproved, isPending, hasActiveMembership, membershipDaysRemaining, membershipStatus } = useAuth();

  // If student is not approved, prompt to view status
  if (!isAdmin && !isApproved) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Admission Awaiting Approval</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your registration is currently under review by the academic administrator. You will gain access to your learning dashboard once approved.
          </p>
          <button
            onClick={() => navigate('/application-status')}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer touch-target"
          >
            Check Application Status
          </button>
        </div>
      </div>
    );
  }

  // Published courses
  const publishedCourses = useMemo(() => {
    return courses.filter((c) => c.isPublished || isAdmin);
  }, [courses, isAdmin]);

  // Overall statistics
  const totalCompletedLessons = useMemo(() => {
    return userProgress.filter((p) => p.completed).length;
  }, [userProgress]);

  const completedLessonIdSet = useMemo(() => {
    return new Set(userProgress.filter((p) => p.completed).map((p) => p.lessonId));
  }, [userProgress]);

  // Find the most recent active or uncompleted lesson for "Continue Watching"
  const continueWatching = useMemo(() => {
    if (publishedCourses.length === 0 || lessons.length === 0) return null;

    // First check user progress for the most recently updated lesson
    const sortedProgress = [...userProgress].sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });

    if (sortedProgress.length > 0) {
      const match = lessons.find((l) => l.id === sortedProgress[0].lessonId);
      if (match) {
        const c = publishedCourses.find((pc) => pc.id === match.courseId) || publishedCourses[0];
        return { course: c, lesson: match };
      }
    }

    // Look for a course where student has completed some but not all lessons
    for (const c of publishedCourses) {
      const cLessons = lessons.filter((l) => l.courseId === c.id && l.isPublished).sort((a, b) => a.order - b.order);
      const next = cLessons.find((l) => !completedLessonIdSet.has(l.id));
      if (next) {
        return { course: c, lesson: next };
      }
    }

    const firstCourse = publishedCourses[0];
    const firstLesson = lessons.find((l) => l.courseId === firstCourse?.id && l.isPublished);
    return firstCourse && firstLesson ? { course: firstCourse, lesson: firstLesson } : null;
  }, [publishedCourses, lessons, userProgress, completedLessonIdSet]);

  // Subject-wise progress summary
  const subjectProgressList = useMemo(() => {
    const subjects = [
      { name: 'Physics', icon: <Atom className="w-4 h-4 text-cyan-400" />, key: 'phy' },
      { name: 'Mathematics', icon: <Binary className="w-4 h-4 text-sky-400" />, key: 'math' },
      { name: 'Chemistry', icon: <FlaskConical className="w-4 h-4 text-emerald-400" />, key: 'chem' },
      { name: 'Computer Science', icon: <Cpu className="w-4 h-4 text-amber-400" />, key: 'cs' },
    ];

    return subjects.map((subj) => {
      const subjLessons = lessons.filter(
        (l) => (l.subjectId && l.subjectId.includes(subj.key)) || (l.courseId && l.courseId.includes(subj.key))
      );
      const total = subjLessons.length || 15;
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

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="text-cyan-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enrolled Student</span>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-300">{profile?.academicLevel || 'Class 12'}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                {hasActiveMembership ? (
                  <span className="text-emerald-400 font-bold">Annual Membership Active ({membershipDaysRemaining}d left)</span>
                ) : (
                  <span className="text-amber-400 font-bold">Membership Inactive</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {profile?.fullName || user?.displayName || 'Student'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Track your syllabus progress, stream chapter video lectures, and prepare for board exams with conceptual clarity.
              </p>
            </div>

            {/* Overall Progress Stat Box */}
            <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
              <div className="w-11 h-11 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-base font-mono tabular-nums border border-cyan-800">
                {totalCompletedLessons}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Completed Lectures</p>
                <p className="text-sm font-bold text-white font-mono tabular-nums">
                  {totalCompletedLessons} of {lessons.filter((l) => l.isPublished).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Highlight */}
        {continueWatching && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Continue Learning</h2>
              </div>
              <span className="text-xs text-slate-400">Next Recommended Lecture</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                    {continueWatching.course.subject} • {continueWatching.lesson.chapterTitle}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                    {continueWatching.lesson.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Duration: {continueWatching.lesson.durationMinutes} mins • Faculty: {continueWatching.course.instructor}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/learn/${continueWatching.lesson.id}`)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-2 shrink-0 touch-target"
              >
                <PlayCircle className="w-4 h-4 text-slate-950" />
                <span>Resume Lecture</span>
              </button>
            </div>
          </div>
        )}

        {/* Subject-Wise Progress Strip */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Subject-Wise Progress</h2>
            <button
              onClick={() => navigate('/subjects')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectProgressList.map((sp) => (
              <div key={sp.name} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sp.icon}
                    <span className="text-xs font-bold text-white">{sp.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">{sp.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full transition-all duration-300" style={{ width: `${sp.percent}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 font-mono tabular-nums">{sp.completed} of {sp.total} lessons</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Courses Progress Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Your Enrolled Courses</h2>
              <p className="text-xs text-slate-400">Video course series with syllabus numericals</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/subjects')}
                className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition touch-target"
              >
                <Layers className="w-3.5 h-3.5 text-slate-950" />
                <span>Chapter-Wise Subjects</span>
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>All Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course) => {
              const cLessons = lessons.filter((l) => l.courseId === course.id && l.isPublished);
              const progress = computeCourseProgress(
                cLessons.map((l) => l.id),
                Array.from(completedLessonIdSet)
              );

              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-slate-800">
                      <img
                        src={course.thumbnailUrl || '/src/assets/images/subject_physics_lab_1792790230100.jpg'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[11px] font-bold px-2 py-0.5 rounded border border-slate-800">
                        {course.subject}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {course.academicLevel}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mt-0.5">
                          {course.title}
                        </h3>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-mono tabular-nums">{progress.completedCount} / {progress.totalCount} Lectures</span>
                          <span className="text-cyan-400 font-bold font-mono tabular-nums">{progress.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span className="truncate max-w-[150px]">{course.instructor}</span>
                    <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Continue →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Announcements */}
        {announcements.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Board Exam & Circular Notices</h2>
              </div>
              <button
                onClick={() => navigate('/announcements')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                View Noticeboard →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.slice(0, 2).map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-400 uppercase">
                      {item.priority}
                    </span>
                    <span className="text-slate-400 font-mono tabular-nums">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
