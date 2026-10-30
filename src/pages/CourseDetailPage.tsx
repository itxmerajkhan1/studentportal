import React, { useState, useMemo } from 'react';
import { Course, Lesson, LessonProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import { computeCourseProgress } from '../utils/portalLogic';
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import physicsImg from '../assets/images/subject_physics_lab_1792790230100.jpg';
import chemImg from '../assets/images/subject_chemistry_bench_1792790230471.jpg';
import mathImg from '../assets/images/subject_math_geometry_1792790230632.jpg';
import heroImg from '../assets/images/hero_academic_study_1792790229058.jpg';

interface CourseDetailPageProps {
  courseId: string;
  courses: Course[];
  lessons: Lesson[];
  userProgress: LessonProgress[];
  navigate: (route: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  courseId,
  courses,
  lessons,
  userProgress,
  navigate,
}) => {
  const { isApproved, isAdmin, isPending } = useAuth();
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  const getFallbackImage = (subject: string) => {
    const sub = subject.toLowerCase();
    if (sub.includes('phys')) return physicsImg;
    if (sub.includes('chem')) return chemImg;
    if (sub.includes('math') || sub.includes('calcu')) return mathImg;
    return heroImg;
  };

  const course = courses.find((c) => c.id === courseId);
  const courseLessons = useMemo(() => {
    return lessons
      .filter((l) => l.courseId === courseId && (l.isPublished || isAdmin))
      .sort((a, b) => a.order - b.order);
  }, [lessons, courseId, isAdmin]);

  const completedLessonIds = useMemo(() => {
    return userProgress.filter((p) => p.courseId === courseId && p.completed).map((p) => p.lessonId);
  }, [userProgress, courseId]);

  const courseProgress = useMemo(() => {
    return computeCourseProgress(
      courseLessons.map((l) => l.id),
      completedLessonIds
    );
  }, [courseLessons, completedLessonIds]);

  // Group lessons by Chapter Title
  const groupedChapters = useMemo(() => {
    const groups: Record<string, Lesson[]> = {};
    courseLessons.forEach((l) => {
      const title = l.chapterTitle || 'General Chapter';
      if (!groups[title]) groups[title] = [];
      groups[title].push(l);
    });
    return groups;
  }, [courseLessons]);

  const toggleChapter = (title: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-xl font-heading font-bold text-slate-900">Course Not Found</h2>
          <p className="text-xs text-slate-600 font-sans">The requested course does not exist or has been removed.</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs shadow"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-xs font-semibold text-[#033D6B] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </button>

        {/* Hero Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#033D6B] text-white px-2.5 py-1 rounded-md">
                  {course.subject}
                </span>
                <span className="text-xs font-semibold text-slate-500">{course.academicLevel}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">{course.title}</h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">{course.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#033D6B]" />
                <span>Instructor: <strong className="text-slate-900">{course.instructor}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-[#033D6B]" />
                <span>{courseLessons.length} Video Lectures</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#033D6B]" />
                <span>{course.duration || 'Full Term'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-video lg:aspect-auto bg-slate-900">
            <img
              src={course.thumbnailUrl || getFallbackImage(course.subject)}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getFallbackImage(course.subject);
              }}
            />
          </div>
        </div>

        {/* Course Progress Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-heading font-bold text-slate-900">Your Course Learning Progress</h2>
            <p className="text-xs text-slate-600 font-sans">
              {courseProgress.completedCount} of {courseProgress.totalCount} lectures finished
            </p>
          </div>
          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold text-[#033D6B]">
              <span>Completion</span>
              <span>{courseProgress.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#033D6B] rounded-full transition-all duration-300" style={{ width: `${courseProgress.percentage}%` }} />
            </div>
          </div>
        </div>

        {/* Chapters & Lectures Accordion */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-slate-900">Chapter Syllabus & Video Lectures</h2>

          {Object.keys(groupedChapters).length > 0 ? (
            Object.entries(groupedChapters).map(([chapTitle, chapLessons]) => {
              const isOpen = openChapters[chapTitle] ?? true;

              return (
                <div key={chapTitle} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  <div
                    onClick={() => toggleChapter(chapTitle)}
                    className="p-5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between gap-4 select-none"
                  >
                    <div className="space-y-0.5">
                      <h3 className="font-heading font-bold text-sm text-slate-900">{chapTitle}</h3>
                      <p className="text-[11px] text-slate-500 font-mono">{chapLessons.length} Video Lectures</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>

                  {isOpen && (
                    <div className="p-4 divide-y divide-slate-100">
                      {chapLessons.map((lec) => {
                        const isDone = completedLessonIds.includes(lec.id);

                        return (
                          <div
                            key={lec.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-3 rounded-xl transition"
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
                                  {lec.description || `Lecture duration: ${lec.durationMinutes} mins`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                              <span className="text-[11px] font-mono text-slate-400">{lec.durationMinutes} mins</span>
                              <button
                                onClick={() => navigate(`/learn/${lec.id}`)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition cursor-pointer shadow-xs"
                              >
                                Stream Video
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 text-xs">
              No video lectures published in this course yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
