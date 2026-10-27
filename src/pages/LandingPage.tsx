import React from 'react';
import { Course } from '../types';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileText,
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
      icon: <Atom className="w-5 h-5 text-[#FECF35]" />,
      chaptersCount: 10,
      lecturesCount: 24,
    },
    {
      id: 'subj-math',
      name: 'Mathematics',
      level: 'Class 11 & 12 • FSc Pre-Engineering / ICS',
      desc: 'Functions & Limits, Differentiation, Integration, Conic Sections, and Vectors with past papers.',
      icon: <Binary className="w-5 h-5 text-[#FECF35]" />,
      chaptersCount: 7,
      lecturesCount: 21,
    },
    {
      id: 'subj-chem',
      name: 'Chemistry',
      level: 'Class 11 & 12 • FSc Pre-Medical / Pre-Engineering',
      desc: 'Periodic Classification, s- and p-Block Elements, Organic Chemistry reaction mechanisms.',
      icon: <FlaskConical className="w-5 h-5 text-[#FECF35]" />,
      chaptersCount: 6,
      lecturesCount: 18,
    },
    {
      id: 'subj-cs',
      name: 'Computer Science',
      level: 'Class 11 & 12 • ICS Stream',
      desc: 'Data Structures, C / C++ Programming, Database Management Systems, and networking basics.',
      icon: <Cpu className="w-5 h-5 text-[#FECF35]" />,
      chaptersCount: 5,
      lecturesCount: 15,
    },
    {
      id: 'subj-mdcat',
      name: 'MDCAT Preparation',
      level: 'Medical Entrance Exam',
      desc: 'High-yield conceptual physics, chemical equilibria, reaction mechanisms, and past exam questions.',
      icon: <GraduationCap className="w-5 h-5 text-[#FECF35]" />,
      chaptersCount: 4,
      lecturesCount: 12,
    },
    {
      id: 'subj-ecat',
      name: 'ECAT / NET Engineering',
      level: 'NUST / GIKI Entry Exam',
      desc: 'Spatial reasoning, structural projections, advanced physics, and entry test speed strategies.',
      icon: <Building className="w-5 h-5 text-[#FECF35]" />,
      chaptersCount: 3,
      lecturesCount: 9,
    },
  ];

  return (
    <div className="bg-[#022544] text-[#FEFEFE] min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:py-20 border-b border-[#FEFEFE]/15 bg-[#033D6B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#093D6C] border border-[#FEFEFE]/20 text-[#FEFEFE] text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-[#FECF35]" />
                <span className="font-semibold text-[#FECF35]">ILMORA</span>
                <span className="text-[#FEFEFE]/40">·</span>
                <span>Learn Today. Lead Tomorrow.</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#FEFEFE] leading-tight font-heading">
                Structured Chapter-Wise Learning for Science & Engineering
              </h1>

              <p className="text-sm sm:text-base text-[#FEFEFE]/85 leading-relaxed max-w-2xl">
                Access curated video lectures, solved textbook numericals, and comprehensive PDF study notes taught by experienced faculty aligned with Punjab, Federal, and Entry Test syllabi.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/subjects')}
                  className="px-6 py-3 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-[#033D6B]" />
                  <span>Explore subjects & chapters</span>
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 rounded-lg bg-[#093D6C] hover:bg-[#0b487e] border border-[#FEFEFE]/25 text-[#FEFEFE] font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Register as student</span>
                  <ArrowRight className="w-4 h-4 text-[#FEFEFE]/70" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-[#FEFEFE]/15 grid grid-cols-3 gap-4 text-xs text-[#FEFEFE]/85 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FECF35] shrink-0" />
                  <span>Admin-verified access</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FECF35] shrink-0" />
                  <span>PDF formula notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FECF35] shrink-0" />
                  <span>Progress tracking</span>
                </div>
              </div>
            </div>

            {/* Right Visual Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-xl overflow-hidden border border-[#FEFEFE]/20 shadow-lg bg-[#093D6C] group">
                <img
                  src="/src/assets/images/hero_academic_study_1792790229058.jpg"
                  alt="Pakistani students studying science textbooks"
                  className="w-full aspect-[4/3] object-cover group-hover:scale-101 transition-transform duration-300"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#022544]/90 via-[#022544]/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-[#033D6B]/90 backdrop-blur-sm border border-[#FEFEFE]/15 text-xs text-[#FEFEFE]">
                  <p className="font-semibold text-[#FEFEFE] font-heading text-sm">ILMORA Digital Classroom</p>
                  <p className="text-[#FEFEFE]/80 text-[11px] mt-0.5">
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
            <span className="text-xs uppercase tracking-wider font-semibold text-[#FECF35] block mb-1">
              Independent Curricula
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#FEFEFE] font-heading">
              Subject Directory
            </h2>
            <p className="text-xs sm:text-sm text-[#FEFEFE]/80 mt-1 max-w-xl">
              Each subject contains its own independent chapters, video lectures, downloadable notes, and progress records.
            </p>
          </div>
          <button
            onClick={() => navigate('/subjects')}
            className="text-xs sm:text-sm font-medium text-[#FECF35] hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto py-2 shrink-0"
          >
            <span>Open interactive syllabus</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectsList.map((subj) => (
            <div
              key={subj.id}
              onClick={() => navigate('/subjects')}
              className="bg-[#093D6C] hover:bg-[#0b487e] border border-[#FEFEFE]/15 p-5 rounded-xl transition duration-150 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-[#033D6B] border border-[#FEFEFE]/15 text-[#FECF35]">
                    {subj.icon}
                  </div>
                  <span className="text-[11px] font-medium text-[#FEFEFE]/75">
                    {subj.level}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#FEFEFE] font-heading group-hover:text-[#FECF35] transition-colors">
                  {subj.name}
                </h3>
                <p className="text-xs text-[#FEFEFE]/80 mt-2 leading-relaxed">
                  {subj.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#FEFEFE]/15 mt-5 flex items-center justify-between text-xs text-[#FEFEFE]/80">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#FECF35]" />
                    <span>{subj.chaptersCount} chapters</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5 text-[#FECF35]" />
                    <span>{subj.lecturesCount} lectures</span>
                  </span>
                </div>
                <span className="text-[#FECF35] font-medium group-hover:translate-x-1 transition-transform">
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Structured Admission Workflow */}
      <section className="py-14 bg-[#033D6B] border-t border-b border-[#FEFEFE]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#FECF35] block mb-1">
              Enrollment Policy
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#FEFEFE] font-heading">
              Student Admission & Verification Workflow
            </h2>
            <p className="text-xs sm:text-sm text-[#FEFEFE]/80 mt-1">
              We uphold academic rigor and verify student profiles to maintain an attentive, focused learning community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#093D6C] border border-[#FEFEFE]/15 p-6 rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#033D6B] text-[#FECF35] border border-[#FEFEFE]/20 flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-[#FEFEFE] font-heading">1. Register Profile</h3>
              <p className="text-xs text-[#FEFEFE]/80 leading-relaxed">
                Provide your full name, academic class (Class 11, Class 12, or Entrance Exam), and verified phone number.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#093D6C] border border-[#FECF35]/40 p-6 rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/40 flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-[#FEFEFE] font-heading">2. Administrative Review</h3>
              <p className="text-xs text-[#FEFEFE]/80 leading-relaxed">
                The portal administrator reviews registrations and activates student access. You can monitor your application status anytime.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#093D6C] border border-[#FEFEFE]/15 p-6 rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#033D6B] text-[#FECF35] border border-[#FEFEFE]/20 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-[#FEFEFE] font-heading">3. Classroom Access</h3>
              <p className="text-xs text-[#FEFEFE]/80 leading-relaxed">
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
            <span className="text-xs uppercase tracking-wider font-semibold text-[#FECF35] block mb-1">
              Curated Video Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#FEFEFE] font-heading">
              Featured Course Lecture Series
            </h2>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs sm:text-sm font-medium text-[#FECF35] hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto py-2 shrink-0"
          >
            <span>View all courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedCourses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="bg-[#093D6C] rounded-xl overflow-hidden border border-[#FEFEFE]/15 hover:border-[#FECF35]/40 transition duration-150 cursor-pointer flex flex-col group shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-[#033D6B]">
                <img
                  src={
                    course.thumbnailUrl ||
                    '/src/assets/images/subject_physics_lab_1792790230100.jpg'
                  }
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#022544]/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-[#033D6B]/90 text-[#FECF35] text-[11px] font-medium px-2.5 py-1 rounded border border-[#FEFEFE]/15">
                  {course.subject}
                </span>
              </div>

              {/* Course Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] text-[#FEFEFE]/75 font-medium">{course.academicLevel}</span>
                  <h3 className="text-base font-semibold text-[#FEFEFE] font-heading group-hover:text-[#FECF35] transition-colors line-clamp-2 mt-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#FEFEFE]/80 line-clamp-2 mt-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#FEFEFE]/15 flex items-center justify-between text-xs text-[#FEFEFE]/75">
                  <span className="font-medium text-[#FEFEFE]/90 truncate max-w-[170px]">
                    {course.instructor}
                  </span>
                  <span className="text-[#FECF35] font-medium">Start lecture →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Annual Membership Plan Strip */}
      <section className="py-14 bg-[#033D6B] border-t border-[#FEFEFE]/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#FECF35]">
            Student Access Pass
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#FEFEFE] font-heading">
            Rs. 1,000 / Year All-Access Membership
          </h2>
          <p className="text-xs sm:text-sm text-[#FEFEFE]/85 max-w-xl mx-auto leading-relaxed">
            Unrestricted access to all Physics, Mathematics, Chemistry, English, and CS chapters, HD video lessons, and printable notes. Simple payment verification via Bank Transfer (Meezan Bank), SadaPay, or Easypaisa.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/membership')}
              className="px-6 py-3 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-xs transition cursor-pointer shadow-sm"
            >
              View membership details
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 rounded-lg bg-[#093D6C] hover:bg-[#0b487e] border border-[#FEFEFE]/25 text-[#FEFEFE] font-medium text-xs transition cursor-pointer"
            >
              Register for admission
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
