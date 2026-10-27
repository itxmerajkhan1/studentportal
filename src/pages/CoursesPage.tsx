import React, { useState, useMemo } from 'react';
import { Course } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  BookOpen,
  PlayCircle,
  Lock,
  Clock,
  Sparkles,
  GraduationCap,
  CheckCircle,
} from 'lucide-react';

import physicsImg from '../assets/images/subject_physics_lab_1792790230100.jpg';
import chemImg from '../assets/images/subject_chemistry_bench_1792790230471.jpg';
import mathImg from '../assets/images/subject_math_geometry_1792790230632.jpg';
import heroImg from '../assets/images/hero_academic_study_1792790229058.jpg';

interface CoursesPageProps {
  courses: Course[];
  navigate: (route: string) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ courses, navigate }) => {
  const { isApproved, isAdmin, isPending } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const subjects = ['all', 'Physics', 'Mathematics', 'Chemistry', 'English', 'Computer Science', 'NET Preparation'];
  const levels = [
    'all',
    'FSc Part 2 (Class 12)',
    'FSc Part 1 (Class 11)',
    'Matriculation Class 10',
    'Matriculation Class 9',
  ];

  const getFallbackImage = (subject: string) => {
    const sub = subject.toLowerCase();
    if (sub.includes('phys')) return physicsImg;
    if (sub.includes('chem')) return chemImg;
    if (sub.includes('math') || sub.includes('calcu')) return mathImg;
    return heroImg;
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Must be published unless admin
      if (!c.isPublished && !isAdmin) return false;

      const matchesSearch =
        searchQuery.trim() === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject === 'all' || c.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesLevel = selectedLevel === 'all' || c.academicLevel.includes(selectedLevel);

      return matchesSearch && matchesSubject && matchesLevel;
    });
  }, [courses, searchQuery, selectedSubject, selectedLevel, isAdmin]);

  return (
    <div className="bg-[#022544] text-[#FEFEFE] min-h-screen py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#FEFEFE]/15">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#093D6C] text-[#FECF35] text-xs font-semibold border border-[#FECF35]/30 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#FECF35]" />
              <span>Full Curriculum Directory</span>
            </div>
            <h1 className="text-3xl font-heading font-semibold text-[#FEFEFE] tracking-tight">
              Curated Science & Engineering Courses
            </h1>
            <p className="text-xs sm:text-sm text-[#FEFEFE]/75 mt-1 font-sans">
              Chapter-wise video series with past paper explanations and textbook derivations.
            </p>
          </div>

          {!isApproved && !isAdmin && (
            <div className="bg-[#093D6C] border border-[#FECF35]/30 p-3.5 rounded-xl flex items-center gap-3 text-xs max-w-md shadow-md">
              <Lock className="w-5 h-5 text-[#FECF35] shrink-0" />
              <div>
                <p className="font-heading font-semibold text-[#FEFEFE]">Enrollment Approval Required</p>
                <p className="text-[#FEFEFE]/75 text-[11px] font-sans">
                  {isPending
                    ? 'Your account is under admin review. Once approved, lecture streams unlock.'
                    : 'Register and submit your admission application to unlock lecture videos.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#093D6C] border border-[#FEFEFE]/15 p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#FEFEFE]/45 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search lectures, topics, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-xs text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-1 focus:ring-[#FECF35] focus:border-[#FECF35]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex items-center gap-1 bg-[#033D6B] p-1 rounded-lg border border-[#FEFEFE]/15 text-xs shrink-0">
              <span className="px-2 text-[#FEFEFE]/60 font-medium">Subject:</span>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition cursor-pointer min-h-[36px] flex items-center ${
                    selectedSubject === sub
                      ? 'bg-[#FECF35] text-[#033D6B] font-semibold shadow-sm'
                      : 'text-[#FEFEFE]/75 hover:text-[#FEFEFE]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-[#093D6C]/50 border border-[#FEFEFE]/15 rounded-2xl p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-[#FEFEFE]/40 mx-auto" />
            <h3 className="text-lg font-heading font-semibold text-[#FEFEFE]">No Courses Found</h3>
            <p className="text-xs text-[#FEFEFE]/60 max-w-sm mx-auto font-sans">
              No curriculum series match your current search and subject filters. Try resetting the filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSelectedLevel('all');
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-[#FECF35] text-xs font-medium text-[#033D6B] hover:bg-[#ebd02f] cursor-pointer shadow"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="bg-[#093D6C] border border-[#FEFEFE]/15 hover:border-[#FECF35]/40 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col group shadow-md"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video overflow-hidden bg-[#033D6B]">
                  <img
                    src={course.thumbnailUrl || getFallbackImage(course.subject)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImage(course.subject);
                    }}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#022544]/90 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-[#033D6B]/90 text-[#FECF35] text-[11px] font-semibold px-2.5 py-1 rounded border border-[#FECF35]/25">
                      {course.subject}
                    </span>
                    {!course.isPublished && (
                      <span className="bg-rose-950/80 text-rose-300 text-[10px] font-medium px-2 py-0.5 rounded border border-rose-700">
                        Draft (Admin Only)
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    {isApproved || isAdmin ? (
                      <span className="bg-[#033D6B]/90 text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 shadow">
                        <CheckCircle className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="bg-[#033D6B]/90 text-[#FECF35] text-[10px] font-medium px-2 py-0.5 rounded border border-[#FECF35]/30 flex items-center gap-1 shadow">
                        <Lock className="w-3 h-3" /> Approval Needed
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-medium text-[#FEFEFE]/60">
                      {course.academicLevel}
                    </span>
                    <h3 className="text-base font-heading font-semibold text-[#FEFEFE] group-hover:text-[#FECF35] transition-colors mt-1 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#FEFEFE]/75 line-clamp-2 mt-2 leading-relaxed font-sans">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#FEFEFE]/10 flex items-center justify-between text-xs text-[#FEFEFE]/70">
                    <div>
                      <p className="font-medium text-[#FEFEFE]">{course.instructor}</p>
                      <p className="text-[10px] text-[#FEFEFE]/60">{course.duration || '15+ Hours'}</p>
                    </div>
                    <span className="text-[#FECF35] font-medium group-hover:translate-x-1 transition-transform">
                      {isApproved || isAdmin ? 'Open Syllabus →' : 'View Preview →'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
