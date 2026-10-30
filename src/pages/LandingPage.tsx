import React from 'react';
import { Course } from '../types';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Atom,
  Binary,
  FlaskConical,
  Cpu,
  Building,
  GraduationCap,
  PlayCircle,
  Layers,
  Sparkles,
  Users,
  Award,
  Video,
} from 'lucide-react';
import { IlmoraLogo } from '../components/IlmoraLogo';

interface LandingPageProps {
  courses: Course[];
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ courses, navigate }) => {
  const publishedCourses = courses.filter((c) => c.isPublished);

  const subjectsList = [
    {
      id: 'subj-physics',
      name: 'Physics',
      level: 'Class 11 & 12 • FSc Pre-Engineering / Pre-Medical',
      desc: 'Electrostatics, Current Electricity, Electromagnetism, Nuclear Physics, and board derivations.',
      icon: <Atom className="w-5 h-5 text-[#033D6B]" />,
      chaptersCount: 10,
      lecturesCount: 24,
    },
    {
      id: 'subj-math',
      name: 'Mathematics',
      level: 'Class 11 & 12 • FSc Pre-Engineering / ICS',
      desc: 'Functions & Limits, Differentiation, Integration, Conic Sections, and Vectors with past papers.',
      icon: <Binary className="w-5 h-5 text-[#033D6B]" />,
      chaptersCount: 7,
      lecturesCount: 21,
    },
    {
      id: 'subj-chem',
      name: 'Chemistry',
      level: 'Class 11 & 12 • FSc Pre-Medical / Pre-Engineering',
      desc: 'Periodic Classification, s- and p-Block Elements, Organic Chemistry reaction mechanisms.',
      icon: <FlaskConical className="w-5 h-5 text-[#033D6B]" />,
      chaptersCount: 6,
      lecturesCount: 18,
    },
    {
      id: 'subj-cs',
      name: 'Computer Science',
      level: 'Class 11 & 12 • ICS Stream',
      desc: 'Data Structures, C / C++ Programming, Database Management Systems, and networking basics.',
      icon: <Cpu className="w-5 h-5 text-[#033D6B]" />,
      chaptersCount: 5,
      lecturesCount: 15,
    },
    {
      id: 'subj-mdcat',
      name: 'MDCAT Preparation',
      level: 'Medical Entrance Exam',
      desc: 'High-yield conceptual physics, chemical equilibria, reaction mechanisms, and past exam questions.',
      icon: <GraduationCap className="w-5 h-5 text-[#033D6B]" />,
      chaptersCount: 4,
      lecturesCount: 12,
    },
    {
      id: 'subj-ecat',
      name: 'ECAT / NET Engineering',
      level: 'NUST / GIKI Entry Exam',
      desc: 'Spatial reasoning, structural projections, advanced physics, and entry test speed strategies.',
      icon: <Building className="w-5 h-5 text-[#033D6B]" />,
      chaptersCount: 3,
      lecturesCount: 9,
    },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen selection:bg-[#FECF35] selection:text-[#033D6B]">
      {/* Top Banner / Hero Container */}
      <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#033D6B]/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-[#FECF35]" />
                <span className="font-bold text-[#FECF35]">ILMORA</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-200">Learn Today. Lead Tomorrow.</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight leading-tight text-white">
                Master Board Exams & Entry Tests with <span className="text-[#FECF35]">Concept-First</span> Video Lectures
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-2xl">
                Structured video courses for FSc Pre-Engineering, Pre-Medical, ICS, MDCAT, and ECAT students across Pakistan. Built for academic excellence.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3.5 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition shadow-md flex items-center justify-center gap-2 cursor-pointer touch-target"
                >
                  <span>Register Student Admission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/subjects')}
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer touch-target"
                >
                  <BookOpen className="w-4 h-4 text-[#FECF35]" />
                  <span>Browse Subjects & Chapters</span>
                </button>
              </div>

              {/* Quick stats row */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#FECF35]" />
                  <span>Full HD Video Lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Admissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span>FBISE / BISE Boards</span>
                </div>
              </div>
            </div>

            {/* Right Card Feature Mockup */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-white">Student Portal Active</span>
                </div>
                <span className="text-[11px] font-mono text-[#FECF35]">Class 11 & 12</span>
              </div>

              <div className="bg-[#033D6B] border border-cyan-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#FECF35] font-bold">Featured Lecture</span>
                  <span className="text-slate-300 font-mono text-[10px]">Physics • Class 12</span>
                </div>
                <h3 className="text-sm font-heading font-semibold text-white">
                  Electric Field & Coulomb's Law Derivations
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5 text-[#FECF35]" /> 35 mins
                  </span>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-3 py-1 rounded-lg bg-[#FECF35] text-[#033D6B] font-bold text-[11px] hover:bg-[#ebd02f]"
                  >
                    Watch Preview
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-slate-400 text-[10px]">Active Students</p>
                  <p className="text-base font-bold font-mono text-white">1,250+</p>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-slate-400 text-[10px]">Video Lectures</p>
                  <p className="text-base font-bold font-mono text-white">120+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Subjects Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#033D6B] uppercase tracking-wider block">Academic Curriculum</span>
            <h2 className="text-2xl font-heading font-bold text-slate-900 mt-1">Explore Subjects</h2>
          </div>
          <button
            onClick={() => navigate('/subjects')}
            className="text-xs font-semibold text-[#033D6B] hover:underline flex items-center gap-1"
          >
            <span>View all subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectsList.map((subj) => (
            <div
              key={subj.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#033D6B] flex items-center justify-center">
                  {subj.icon}
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-slate-900">{subj.name}</h3>
                  <p className="text-[11px] font-semibold text-[#033D6B] mt-0.5">{subj.level}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{subj.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  {subj.chaptersCount} Chapters • {subj.lecturesCount} Lectures
                </span>
                <button
                  onClick={() => navigate('/subjects')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#FECF35] text-slate-800 hover:text-[#033D6B] font-semibold text-xs transition cursor-pointer"
                >
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      {publishedCourses.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#033D6B] uppercase tracking-wider block">Structured Learning</span>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mt-1">Featured Video Courses</h2>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="text-xs font-semibold text-[#033D6B] hover:underline flex items-center gap-1"
            >
              <span>View all courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.slice(0, 3).map((c) => (
              <div key={c.id} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video bg-slate-900">
                    <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-[#033D6B] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                      {c.subject}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                    <p className="text-[11px] text-[#033D6B] font-medium">Faculty: {c.instructor}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-xs border-t border-slate-100 mt-2 pt-3">
                  <span className="text-slate-500 font-mono text-[11px]">{c.academicLevel}</span>
                  <button
                    onClick={() => navigate(`/courses/${c.id}`)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] shadow-xs cursor-pointer"
                  >
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How ILMORA Works Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-[#033D6B] uppercase tracking-wider block">Admission Process</span>
          <h2 className="text-2xl font-heading font-bold text-slate-900">How ILMORA Works</h2>
          <p className="text-xs text-slate-600 font-sans">Three straightforward steps to unlock full video lecture access.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#033D6B] text-[#FECF35] font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h3 className="text-base font-heading font-bold text-slate-900">Register Admission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit your student profile details, board affiliation, and official contact information through our portal.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#033D6B] text-[#FECF35] font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h3 className="text-base font-heading font-bold text-slate-900">Administrator Approval</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our administration verifies your credentials and membership status to grant authorized streaming access.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#033D6B] text-[#FECF35] font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h3 className="text-base font-heading font-bold text-slate-900">Stream Video Lectures</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access full HD chapter-wise video lectures, track learning progress, and prepare for board exams seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <IlmoraLogo variant="full" theme="light" size="sm" />
            <p className="text-slate-400 text-center md:text-right text-[11px]">
              Helpline / WhatsApp Support: <span className="text-[#FECF35] font-mono">+92 321 2812203</span> • Contact Email: <span className="text-white font-mono">itxmirajkhan@gmail.com</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <p>© {new Date().getFullYear()} ILMORA Learning Portal. All rights reserved.</p>
            <p>Class 11, Class 12 & Entrance Exam Prep • Pakistan</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
