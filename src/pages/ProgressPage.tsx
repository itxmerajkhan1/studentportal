import React, { useMemo } from 'react';
import { Course, Lesson, LessonProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface ProgressPageProps {
  courses: Course[];
  lessons: Lesson[];
  userProgress: LessonProgress[];
  navigate: (route: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  courses,
  lessons,
  userProgress,
  navigate,
}) => {
  const { user, profile } = useAuth();

  const completedProgress = useMemo(() => {
    return userProgress.filter((p) => p.completed);
  }, [userProgress]);

  const completedMap = useMemo(() => {
    const map = new Map<string, LessonProgress>();
    completedProgress.forEach((p) => map.set(p.lessonId, p));
    return map;
  }, [completedProgress]);

  const finishedLessons = useMemo(() => {
    return lessons
      .filter((l) => completedMap.has(l.id))
      .map((l) => ({
        lesson: l,
        course: courses.find((c) => c.id === l.courseId),
        progress: completedMap.get(l.id)!,
      }));
  }, [lessons, courses, completedMap]);

  // Subject wise completion statistics
  const subjectStats = useMemo(() => {
    const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology'];
    return subjects.map((sub) => {
      const subCourses = courses.filter((c) => c.subject.toLowerCase() === sub.toLowerCase());
      const subCourseIds = new Set(subCourses.map((c) => c.id));
      const subLessons = lessons.filter((l) => subCourseIds.has(l.courseId) && l.isPublished);
      const subCompleted = subLessons.filter((l) => completedMap.has(l.id)).length;
      const total = subLessons.length;
      const percentage = total > 0 ? Math.round((subCompleted / total) * 100) : 0;
      return {
        subject: sub,
        completed: subCompleted,
        total,
        percentage,
      };
    });
  }, [courses, lessons, completedMap]);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 text-xs font-semibold border border-cyan-800/50 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Student Learning Portfolio</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Curriculum Progress & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Detailed breakdown of completed textbook chapters and lecture hours.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
              {completedProgress.length}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Finished Lectures</p>
              <p className="text-[11px] text-slate-400">Recorded in Firestore</p>
            </div>
          </div>
        </div>

        {/* Subject Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectStats.map((stat) => (
            <div
              key={stat.subject}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{stat.subject}</h3>
                <span className="text-xs font-bold text-cyan-400">{stat.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400"
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {stat.completed} of {stat.total} lectures completed
              </p>
            </div>
          ))}
        </div>

        {/* Completed Lessons Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Completed Lectures Archive</span>
          </h2>

          {finishedLessons.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p>You haven't marked any lectures as complete yet.</p>
              <button
                onClick={() => navigate('/courses')}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-cyan-400 hover:text-white font-semibold text-xs"
              >
                Browse Lectures Now
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <th className="py-3 px-4">Lecture Title</th>
                    <th className="py-3 px-4">Course & Chapter</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {finishedLessons.map(({ lesson, course, progress }) => (
                    <tr key={lesson.id} className="hover:bg-slate-850/50">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{lesson.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="font-medium text-cyan-300">{course?.subject || 'Science'}:</span>{' '}
                        {lesson.chapterTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {lesson.durationMinutes} mins
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/learn/${lesson.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium transition cursor-pointer"
                        >
                          Rewatch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
