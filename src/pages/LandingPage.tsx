import React from 'react';
import { Course } from '../types';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Atom,
  Binary,
  FlaskConical,
  Cpu,
  Building,
  Languages,
  CheckCircle2,
  PlayCircle,
  FileText,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  courses: Course[];
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ courses, navigate }) => {
  const publishedCourses = courses.filter((c) => c.isPublished);

  // 6 Required Subjects according to the curriculum
  const subjectsList = [
    {
      id: 'physics',
      name: 'Physics',
      level: 'Class 11 & 12 • MDCAT / ECAT',
      desc: 'Electrostatics, Current Electricity, Electromagnetism, and textbook derivations with solved past paper numericals.',
      icon: <Atom className="w-5 h-5 text-cyan-400" />,
      chaptersCount: 5,
      lecturesCount: 16,
      accent: 'border-cyan-500/30',
      iconBg: 'bg-cyan-950/60 text-cyan-400 border border-cyan-800',
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      level: 'Class 11 & 12 • Pre-Engineering',
      desc: 'Functions & Limits, Differential Calculus, Integration, Conic Sections, and Vector Algebra.',
      icon: <Binary className="w-5 h-5 text-sky-400" />,
      chaptersCount: 5,
      lecturesCount: 15,
      accent: 'border-sky-500/30',
      iconBg: 'bg-sky-950/60 text-sky-400 border border-sky-800',
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      level: 'Class 11 & 12 • Pre-Medical',
      desc: 'Periodic Trends, s & p Block Elements, Organic Reaction Mechanisms, and Environmental Chemistry.',
      icon: <FlaskConical className="w-5 h-5 text-emerald-400" />,
      chaptersCount: 5,
      lecturesCount: 14,
      accent: 'border-emerald-500/30',
      iconBg: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800',
    },
    {
      id: 'english',
      name: 'English',
      level: 'Class 11 & 12 • All Streams',
      desc: 'Contextual Grammar, Reading Comprehension, Essays, Translation, and High-Yield Board Vocabulary.',
      icon: <Languages className="w-5 h-5 text-indigo-400" />,
      chaptersCount: 4,
      lecturesCount: 10,
      accent: 'border-indigo-500/30',
      iconBg: 'bg-indigo-950/60 text-indigo-400 border border-indigo-800',
    },
    {
      id: 'computer-science',
      name: 'Computer Science',
      level: 'ICS Stream • Class 11 & 12',
      desc: 'Object-Oriented Programming, Data Structures, Relational Database Normalization, and Boolean Logic.',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      chaptersCount: 4,
      lecturesCount: 12,
      accent: 'border-amber-500/30',
      iconBg: 'bg-amber-950/60 text-amber-400 border border-amber-800',
    },
    {
      id: 'net-architecture',
      name: 'NET Architecture',
      level: 'NUST / GIKI Entry Exam',
      desc: 'Spatial Reasoning, Structural Projections, Advanced Physics, and Entry Test Speed Strategies.',
      icon: <Building className="w-5 h-5 text-violet-400" />,
      chaptersCount: 3,
      lecturesCount: 9,
      accent: 'border-violet-500/30',
      iconBg: 'bg-violet-950/60 text-violet-400 border border-violet-800',
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section: Split 2-Column Balance */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-800/50 text-slate-300 text-xs font-medium shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold text-cyan-300">ILMORA</span>
                <span className="text-slate-600">·</span>
                <span>Learn Today. Lead Tomorrow.</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Structured Chapter-Wise Learning for Science & Engineering
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Access curated video lectures, solved textbook numericals, and comprehensive PDF study notes taught by experienced faculty aligned with Punjab, Federal, and Entry Test syllabi.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/subjects')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer touch-target"
                >
                  <BookOpen className="w-4 h-4 text-slate-950" />
                  <span>Explore Subjects & Chapters</span>
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer touch-target"
                >
                  <span>Register as Student</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-slate-800/70 grid grid-cols-3 gap-4 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Admin-Verified Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PDF Formula Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Progress Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Visual Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
                <img
                  src="/src/assets/images/hero_academic_study_1792790229058.jpg"
                  alt="Pakistani students studying science textbooks"
                  className="w-full aspect-[4/3] object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs">
                  <p className="font-bold text-white">ILMORA Digital Classroom</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Concept-first lecture delivery with step-by-step problem derivations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Independent Subjects Section */}
      <section className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-400 block mb-1">
              Independent Curricula
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Subject Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Each subject contains its own independent chapters, video lectures, downloadable notes, and progress records.
            </p>
          </div>
          <button
            onClick={() => navigate('/subjects')}
            className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto py-2 shrink-0"
          >
            <span>Open Interactive Syllabus</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectsList.map((subj) => (
            <div
              key={subj.id}
              onClick={() => navigate('/subjects')}
              className={`bg-slate-900/90 hover:bg-slate-900 border border-slate-800 ${subj.accent} p-5 rounded-2xl transition-all duration-200 cursor-pointer group shadow-sm flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${subj.iconBg}`}>
                    {subj.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {subj.level}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {subj.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {subj.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{subj.chaptersCount} Chapters</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <PlayCircle className="w-3.5 h-3.5 text-sky-400" />
                    <span>{subj.lecturesCount} Lectures</span>
                  </span>
                </div>
                <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Structured Admission Workflow */}
      <section className="py-14 bg-slate-900/40 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-400 block mb-1">
              Enrollment Policy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Student Admission & Verification Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              We uphold academic rigor and verify student profiles to maintain an attentive, focused learning community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative shadow-sm space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-white">1. Register Profile</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Provide your full name, academic class (Class 11, Class 12, or Entrance Exam), and verified phone number.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 border border-cyan-800/60 p-6 rounded-2xl relative shadow-md shadow-cyan-950/30 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-950 text-sky-400 border border-sky-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-white">2. Administrative Review</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The portal administrator reviews registrations and activates student access. You can monitor your application status anytime.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative shadow-sm space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-white">3. Classroom Access</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Once approved, stream lectures, save your chapter progress in Firestore, and download official formula resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-400 block mb-1">
              Curated Video Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Featured Course Lecture Series
            </h2>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto py-2 shrink-0"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedCourses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition duration-200 cursor-pointer flex flex-col group shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-slate-800">
                <img
                  src={
                    course.thumbnailUrl ||
                    '/src/assets/images/subject_physics_lab_1792790230100.jpg'
                  }
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[11px] font-bold px-2.5 py-1 rounded-md border border-slate-800">
                  {course.subject}
                </span>
              </div>

              {/* Course Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold">{course.academicLevel}</span>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mt-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300 truncate max-w-[170px]">
                    {course.instructor}
                  </span>
                  <span className="text-cyan-400 font-semibold">Start Lecture →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Annual Membership Plan Strip */}
      <section className="py-14 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
            Student Access Pass
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Rs. 1,000 / Year All-Access Membership
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Unrestricted access to all Physics, Mathematics, Chemistry, English, and CS chapters, HD video lessons, and printable notes. Simple payment verification via Bank Transfer (Meezan Bank), SadaPay, or Easypaisa.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/membership')}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer touch-target"
            >
              View Membership Details
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer touch-target"
            >
              Register for Admission
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
