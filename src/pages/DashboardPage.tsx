import React, { useMemo } from 'react';
import { Course, Lesson, LessonProgress, Announcement } from '../types';
import { useAuth } from '../context/AuthContext';
import { computeCourseProgress, getNextLesson } from '../utils/portalLogic';
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  Bell,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
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
  const { user, profile, isAdmin, isApproved, isPending } = useAuth();

  // If student is not approved, prompt to view status
  if (!isAdmin && !isApproved) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <Clock className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold">Admission Awaiting Approval</h2>
          <p className="text-xs text-slate-400">
            Your registration is currently under review by the academic administrator. You will gain access to your learning dashboard once approved.
          </p>
          <button
            onClick={() => navigate('/application-status')}
            className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
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

    // Look for a course where student has completed some but not all lessons
    for (const c of publishedCourses) {
      const cLessons = lessons.filter((l) => l.courseId === c.id && l.isPublished).sort((a, b) => a.order - b.order);
      const next = cLessons.find((l) => !completedLessonIdSet.has(l.id));
      if (next) {
        return { course: c, lesson: next };
      }
    }
    // If all completed or none started, pick the first lesson of first course
    const firstCourse = publishedCourses[0];
    const firstLesson = lessons.find((l) => l.courseId === firstCourse?.id && l.isPublished);
    return firstCourse && firstLesson ? { course: firstCourse, lesson: firstLesson } : null;
  }, [publishedCourses, lessons, completedLessonIdSet]);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-80 h-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Student Portal • {profile?.academicLevel || 'Class 12'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {profile?.fullName || user?.displayName || 'Student'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Track your syllabus progress, watch chapter lectures, and prepare for board exams with conceptual clarity.
              </p>
            </div>

            {/* Overall Progress Stat Box */}
            <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl shrink-0">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg border border-cyan-500/30">
                {totalCompletedLessons}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Lectures Completed</p>
                <p className="text-sm font-bold text-white">
                  {totalCompletedLessons} of {lessons.filter((l) => l.isPublished).length} Total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Watching Highlight */}
        {continueWatching && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Continue Watching</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Next Recommended Lecture</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-400 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                    {continueWatching.course.subject} • {continueWatching.lesson.chapterTitle}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    {continueWatching.lesson.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Duration: {continueWatching.lesson.durationMinutes} mins • Instructor: {continueWatching.course.instructor}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/learn/${continueWatching.lesson.id}`)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Resume Lecture</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Courses Progress Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Your Enrolled Courses</h2>
              <p className="text-xs text-slate-400">Track chapter completion rates across all science curricula</p>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-slate-800">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 bg-cyan-950/80 backdrop-blur-md text-cyan-300 text-[11px] font-bold px-2 py-0.5 rounded border border-cyan-800">
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
                          <span className="text-slate-400">{progress.completedCount} / {progress.totalCount} Lectures</span>
                          <span className="text-cyan-400 font-bold">{progress.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Board Exam & Portal Circulars</h2>
              </div>
              <button
                onClick={() => navigate('/announcements')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View Noticeboard →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.slice(0, 2).map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                      {item.priority.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
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
