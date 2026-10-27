import React, { useState, useMemo } from 'react';
import { Course, Lesson, LessonProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import { computeCourseProgress, getNextLesson } from '../utils/portalLogic';
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  FileText,
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
  const { isApproved, isAdmin, isPending, user } = useAuth();
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

  const progress = useMemo(() => {
    return computeCourseProgress(
      courseLessons.map((l) => l.id),
      completedLessonIds
    );
  }, [courseLessons, completedLessonIds]);

  // Group lessons by chapterTitle
  const chapters = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    courseLessons.forEach((l) => {
      const ch = l.chapterTitle || 'Chapter 1: Core Fundamentals';
      if (!map.has(ch)) map.set(ch, []);
      map.get(ch)!.push(l);
    });
    return Array.from(map.entries()).map(([chapterTitle, chapterLessons]) => ({
      chapterTitle,
      chapterLessons,
    }));
  }, [courseLessons]);

  const toggleChapter = (title: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [title]: prev[title] === undefined ? false : !prev[title],
    }));
  };

  const nextLesson = getNextLesson(courseLessons, completedLessonIds);

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Course Not Found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const canStream = isApproved || isAdmin;

  return (
    <div className="bg-[#022544] text-[#FEFEFE] min-h-screen py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Link */}
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-xs text-[#FEFEFE]/75 hover:text-[#FECF35] font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all courses</span>
        </button>

        {/* Hero Header Card */}
        <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-3">
          {/* Details */}
          <div className="p-6 sm:p-8 lg:col-span-2 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/25">
                  {course.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#033D6B] text-[#FEFEFE]/80 border border-[#FEFEFE]/15">
                  {course.academicLevel}
                </span>
                {canStream && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#033D6B] text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Enrolled & Verified
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#FEFEFE] leading-tight">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#FEFEFE]/75 leading-relaxed font-sans">
                {course.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#FEFEFE]/70 font-sans">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#FECF35]" />
                  <span className="text-[#FEFEFE] font-medium">{course.instructor}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#FEFEFE]/50" />
                  <span>{course.duration || '16+ Hours'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#FEFEFE]/50" />
                  <span>{courseLessons.length} Detailed Lectures</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#FEFEFE]/10">
              {canStream ? (
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#FEFEFE]/70 font-medium">Your Syllabus Progress:</span>
                      <span className="text-[#FECF35] font-semibold font-mono tabular-nums">{progress.percentage}% Completed</span>
                    </div>
                    <div className="w-full h-2 bg-[#022544] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FECF35] transition-all duration-500"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {nextLesson && (
                    <button
                      onClick={() => navigate(`/learn/${nextLesson.id}`)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-sm shadow transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-5 h-5 text-[#033D6B]" />
                      <span>{progress.completedCount > 0 ? 'Resume Learning' : 'Start Course Lectures'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-[#033D6B] border border-[#FECF35]/30 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[#FECF35] text-xs">
                    <Lock className="w-4 h-4" />
                    <span>Protected Video Classroom</span>
                  </div>
                  <p className="text-xs text-[#FEFEFE]/75 leading-relaxed font-sans">
                    {user
                      ? isPending
                        ? 'Your registration is awaiting administrative approval. Once confirmed, you can stream all lectures.'
                        : 'Your student account requires verified approval to access lecture video streams.'
                      : 'Please sign in or register as a student to submit an admission request and unlock these lectures.'}
                  </p>
                  <button
                    onClick={() => navigate(user ? '/application-status' : '/register')}
                    className="px-4 py-2 rounded-lg bg-[#FECF35] text-[#033D6B] font-medium text-xs hover:bg-[#ebd02f] transition cursor-pointer shadow"
                  >
                    {user ? 'View application status' : 'Register for admission'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="relative aspect-video lg:aspect-auto h-full bg-[#033D6B] overflow-hidden border-t lg:border-t-0 lg:border-l border-[#FEFEFE]/15">
            <img
              src={course.thumbnailUrl || getFallbackImage(course.subject)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackImage(course.subject);
              }}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#022544]/90 via-transparent to-transparent lg:hidden" />
          </div>
        </div>

        {/* Syllabus / Lecture Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-[#FEFEFE] tracking-tight">
              Course Syllabus & Lectures
            </h2>
            <span className="text-xs text-[#FEFEFE]/60 font-sans font-medium">
              {chapters.length} Chapters • {courseLessons.length} Total Lessons
            </span>
          </div>

          <div className="space-y-4">
            {chapters.map((ch, idx) => {
              const isOpen = openChapters[ch.chapterTitle] !== false; // default open
              return (
                <div
                  key={ch.chapterTitle}
                  className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl overflow-hidden shadow-md"
                >
                  {/* Chapter Header */}
                  <button
                    onClick={() => toggleChapter(ch.chapterTitle)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#07355c] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#033D6B] text-[#FECF35] flex items-center justify-center font-semibold text-xs border border-[#FEFEFE]/15">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-[#FEFEFE] text-sm sm:text-base">{ch.chapterTitle}</h3>
                        <p className="text-[11px] text-[#FEFEFE]/60 font-sans">{ch.chapterLessons.length} Lectures</p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#FEFEFE]/70" /> : <ChevronDown className="w-4 h-4 text-[#FEFEFE]/70" />}
                  </button>

                  {/* Chapter Lessons */}
                  {isOpen && (
                    <div className="border-t border-[#FEFEFE]/10 divide-y divide-[#FEFEFE]/10 bg-[#033D6B]/40">
                      {ch.chapterLessons.map((lesson) => {
                        const isDone = completedLessonIds.includes(lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => {
                              if (canStream) {
                                navigate(`/learn/${lesson.id}`);
                              } else {
                                navigate(user ? '/application-status' : '/register');
                              }
                            }}
                            className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition cursor-pointer ${
                              canStream ? 'hover:bg-[#093D6C]/60' : 'opacity-80 hover:bg-[#093D6C]/40'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {canStream ? (
                                  isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4 text-[#FECF35]" />
                                  )
                                ) : (
                                  <Lock className="w-4 h-4 text-[#FEFEFE]/40" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-medium text-[#FEFEFE] hover:text-[#FECF35]">
                                  {lesson.title}
                                </h4>
                                <p className="text-[11px] text-[#FEFEFE]/70 line-clamp-1 mt-0.5 font-sans">
                                  {lesson.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 text-xs">
                              <span className="text-[#FEFEFE]/60 text-[11px] font-sans">
                                {lesson.durationMinutes} mins
                              </span>
                              {lesson.pdfNotesUrl && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-[#033D6B] text-[#FECF35] px-2 py-0.5 rounded border border-[#FECF35]/25">
                                  <FileText className="w-3 h-3 text-[#FECF35]" /> Notes
                                </span>
                              )}
                              <span className="text-[#FECF35] font-medium text-xs">
                                {canStream ? (isDone ? 'Rewatch' : 'Play') : 'Locked'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
