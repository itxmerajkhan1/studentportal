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
    const subjects = ['Physics', 'Mathematics', 'Chemistry', 'English', 'Computer Science'];
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
    <div className="bg-[#022544] text-[#FEFEFE] min-h-screen py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#FEFEFE]/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#033D6B] text-[#FECF35] text-xs font-medium border border-[#FECF35]/30 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Student Learning Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#FEFEFE] tracking-tight">
              Curriculum progress & analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#FEFEFE]/70 mt-1">
              Detailed breakdown of completed textbook chapters and lecture hours.
            </p>
          </div>

          <div className="bg-[#093D6C] border border-[#FEFEFE]/15 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#033D6B] text-[#FECF35] flex items-center justify-center font-bold border border-[#FECF35]/30">
              {completedProgress.length}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#FEFEFE]">Finished lectures</p>
              <p className="text-[11px] text-[#FEFEFE]/60">Recorded in student profile</p>
            </div>
          </div>
        </div>

        {/* Subject Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {subjectStats.map((stat) => (
            <div
              key={stat.subject}
              className="bg-[#093D6C] border border-[#FEFEFE]/15 p-5 rounded-xl space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-semibold text-[#FEFEFE]">{stat.subject}</h3>
                <span className="text-xs font-semibold text-[#FECF35]">{stat.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-[#033D6B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FECF35] rounded-full transition-all duration-300"
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-[#FEFEFE]/60">
                {stat.completed} of {stat.total} lectures completed
              </p>
            </div>
          ))}
        </div>

        {/* Completed Lessons Table */}
        <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-heading font-semibold text-[#FEFEFE] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Completed lectures archive</span>
          </h2>

          {finishedLessons.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#FEFEFE]/60 space-y-3">
              <Clock className="w-8 h-8 text-[#FEFEFE]/30 mx-auto" />
              <p>You haven't marked any lectures as complete yet.</p>
              <button
                onClick={() => navigate('/subjects')}
                className="mt-2 px-4 py-2 rounded-lg bg-[#FECF35] text-[#033D6B] hover:bg-[#ebd02f] font-medium text-xs transition cursor-pointer"
              >
                Browse subjects now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#FEFEFE]/60 uppercase text-[11px] border-b border-[#FEFEFE]/10">
                    <th className="py-3 px-4 font-medium">Lecture Title</th>
                    <th className="py-3 px-4 font-medium">Course & Chapter</th>
                    <th className="py-3 px-4 font-medium">Duration</th>
                    <th className="py-3 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FEFEFE]/10">
                  {finishedLessons.map(({ lesson, course, progress }) => (
                    <tr key={lesson.id} className="hover:bg-[#033D6B]/50 transition">
                      <td className="py-3.5 px-4 font-medium text-[#FEFEFE]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{lesson.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#FEFEFE]/80">
                        <span className="font-semibold text-[#FECF35]">{course?.subject || 'Science'}:</span>{' '}
                        {lesson.chapterTitle}
                      </td>
                      <td className="py-3.5 px-4 text-[#FEFEFE]/60">
                        {lesson.durationMinutes} mins
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/learn/${lesson.id}`)}
                          className="px-3 py-1.5 rounded-md bg-[#033D6B] hover:bg-[#FECF35] hover:text-[#033D6B] text-[#FECF35] font-medium transition cursor-pointer border border-[#FEFEFE]/10"
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
