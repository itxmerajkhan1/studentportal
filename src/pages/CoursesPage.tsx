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

  const subjects = ['all', 'Physics', 'Mathematics', 'Chemistry', 'Computer Science', 'NET Preparation'];
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
      if (!c.isPublished && !isAdmin) return false;

      const matchesSearch =
        searchQuery.trim() === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject === 'all' || c.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesLevel = selectedLevel === 'all' || c.academicLevel.toLowerCase() === selectedLevel.toLowerCase();

      return matchesSearch && matchesSubject && matchesLevel;
    });
  }, [courses, searchQuery, selectedSubject, selectedLevel, isAdmin]);

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-[#033D6B]">
              <BookOpen className="w-3.5 h-3.5 text-[#033D6B]" />
              <span>Video Course Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
              Academic Video Courses
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Structured video curriculum tailored for intermediate board exams and engineering/medical entrance tests.
            </p>
          </div>

          {/* Search & Selectors */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search course or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-800"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Subjects' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-slate-900">
                    <img
                      src={c.thumbnailUrl || getFallbackImage(c.subject)}
                      alt={c.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage(c.subject);
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-[#033D6B] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                      {c.subject}
                    </span>
                    {!c.isPublished && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded">
                        Draft Mode
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h2 className="font-heading font-bold text-base text-slate-900 line-clamp-1">{c.title}</h2>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>
                    <p className="text-[11px] text-[#033D6B] font-semibold">Faculty: {c.instructor}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs mt-3 pt-4">
                  <span className="text-slate-500 font-mono text-[11px]">{c.academicLevel}</span>
                  <button
                    onClick={() => navigate(`/courses/${c.id}`)}
                    className="px-4 py-2 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition cursor-pointer shadow-xs"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-xs">
              No courses match your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
