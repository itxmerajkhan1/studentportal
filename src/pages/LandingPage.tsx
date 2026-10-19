import React from 'react';
import { Course } from '../types';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  PlayCircle,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Atom,
  Binary,
  FlaskConical,
  Dna,
  Users,
  Award,
  Video,
} from 'lucide-react';

interface LandingPageProps {
  courses: Course[];
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ courses, navigate }) => {
  const publishedCourses = courses.filter((c) => c.isPublished);

  const categories = [
    {
      name: 'Physics',
      icon: <Atom className="w-6 h-6 text-cyan-400" />,
      desc: 'Vectors, Electromagnetism, Modern Physics & Past Papers',
      count: 'FSc 11, 12 & MDCAT',
      badge: 'Popular',
    },
    {
      name: 'Mathematics',
      icon: <Binary className="w-6 h-6 text-sky-400" />,
      desc: 'Calculus, Trigonometry, Analytical Geometry & Vectors',
      count: 'Class 11 & 12',
      badge: 'High Yield',
    },
    {
      name: 'Chemistry',
      icon: <FlaskConical className="w-6 h-6 text-teal-400" />,
      desc: 'Organic Reaction Mechanisms, Stoichiometry & Kinetics',
      count: 'Punjab & Federal Boards',
      badge: 'Detailed',
    },
    {
      name: 'Biology & MDCAT',
      icon: <Dna className="w-6 h-6 text-indigo-400" />,
      desc: 'Genetics, Human Physiology & High-Yield MCQs',
      count: 'Medical Entrance Tests',
      badge: 'Comprehensive',
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800 bg-radial from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Online Learning Portal — Inspired by Academic Rigor</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Master Science & Engineering with{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                Conceptual Clarity
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Curated chapter-by-chapter video lectures, solved textbook numericals, and comprehensive board exam notes for Pakistani students.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-sky-400 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-sky-300 shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Register for Admission</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Explore Lecture Catalog</span>
              </button>
            </div>

            {/* Highlights pill */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Student Access
              </span>
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-cyan-400" /> HD Video Lectures & Notes
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Punjab & Federal Board Aligned
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Registration & Approval Workflow Explainer */}
      <section className="py-14 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-2">
              Structured Verification Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              How Student Admission Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              We uphold academic focus by vetting student registrations before granting access to protected video content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h4 className="text-base font-bold text-white mb-2">1. Submit Student Profile</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fill in your full name, academic class (e.g. FSc Part 2 / Class 12), active Pakistani phone number, and password.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/90 border border-cyan-800/50 p-6 rounded-2xl relative shadow-lg shadow-cyan-950/40">
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-sky-400 border border-sky-800 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h4 className="text-base font-bold text-white mb-2">2. Administrative Review</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your application moves to pending review. The portal administrator verifies your details and unlocks your curriculum.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h4 className="text-base font-bold text-white mb-2">3. Immediate Classroom Access</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Once approved, log in anytime to stream HD video lectures, download lecture notes, track your progress, and excel in exams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-2">
              Curriculum Tracks
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Subject Categories
            </h3>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Lectures</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate('/courses')}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl transition duration-200 cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 group-hover:scale-105 transition-transform">
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                    {cat.badge}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="pt-6 border-t border-slate-800/60 mt-4 flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>{cat.count}</span>
                <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Explore →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="py-16 bg-slate-900/50 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-2">
              High-Yield Series
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Featured Video Lectures
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Taught by distinguished faculty members with board exam preparation emphasis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition duration-200 cursor-pointer flex flex-col group shadow-xl"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-slate-800">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-cyan-950/80 backdrop-blur-md text-cyan-300 text-[11px] font-bold px-2.5 py-1 rounded-md border border-cyan-700/60">
                    {course.subject}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40">
                    <div className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/40">
                      <PlayCircle className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold">{course.academicLevel}</span>
                    <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mt-1">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-300 truncate max-w-[180px]">
                      {course.instructor}
                    </span>
                    <span className="text-cyan-400 font-semibold">Start Learning →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Browse All Courses & Lecture Chapters
            </button>
          </div>
        </div>
      </section>

      {/* Verified Faculty Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-2">
            Academic Mentorship
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Distinguished Science Faculty
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Educators with proven track records of producing board toppers in Punjab, Federal, and Sindh examinations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Sir Meraj Alam',
              role: 'Senior Physics Specialist',
              sub: 'Mechanics & Particle Physics',
              exp: '16+ Years Experience',
            },
            {
              name: 'Prof. Tariq Mehmood',
              role: 'Head of Physics Department',
              sub: 'Electromagnetism & Electronics',
              exp: '18+ Years Experience',
            },
            {
              name: 'Dr. Salman Rashid',
              role: 'Gold Medalist Mathematics',
              sub: 'Calculus & Conic Sections',
              exp: '14+ Years Experience',
            },
            {
              name: 'Madam Ayesha Qureshi',
              role: 'Senior Chemistry Faculty',
              sub: 'Organic Mechanisms & Kinetics',
              exp: '12+ Years Experience',
            },
          ].map((faculty) => (
            <div
              key={faculty.name}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-3 shadow-md"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 mx-auto flex items-center justify-center text-white text-xl font-bold shadow-md">
                {faculty.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{faculty.name}</h4>
                <p className="text-xs font-semibold text-cyan-400">{faculty.role}</p>
                <p className="text-[11px] text-slate-400 mt-1">{faculty.sub}</p>
              </div>
              <span className="inline-block text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
                {faculty.exp}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-cyan-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Begin Your Academic Success Journey Today
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Register your student account in minutes. Once verified by our administration team, unlock the complete curriculum with HD lectures and comprehensive notes.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-400/25 transition cursor-pointer"
            >
              Complete Registration Form
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
