import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ApplicationStatusPage } from './pages/ApplicationStatusPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LearnPage } from './pages/LearnPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { MembershipPage } from './pages/MembershipPage';
import { PaymentPage } from './pages/PaymentPage';
import { Course, Lesson, LessonProgress, Announcement, SiteSettings, Subject, Chapter } from './types';
import { ShieldAlert, Loader2 } from 'lucide-react';
import {
  db,
  fetchPublishedCourses,
  fetchAllCoursesAdmin,
  fetchAnnouncements,
  fetchSiteSettings,
  fetchUserProgress,
  fetchSubjects,
  fetchChapters,
} from './firebase/config';
import {
  seedInitialPortalDataIfEmpty,
  INITIAL_SETTINGS,
  INITIAL_COURSES,
  INITIAL_LESSONS,
  INITIAL_SUBJECTS,
  INITIAL_CHAPTERS,
} from './firebase/seedData';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';

function MainApp() {
  const { user, isAdmin, isApproved, isPending, loading: authLoading } = useAuth();

  // Navigation route state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'ann-1',
      title: 'Mid-Term Exam Prep & Live Problem Solving',
      content: 'All chapter-wise past paper solutions have been uploaded under Physics & Mathematics. Students are advised to review them.',
      priority: 'urgent',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ann-2',
      title: 'MDCAT & ECAT Syllabus Synchronisation',
      content: 'Updated high-yield organic reaction mechanisms and vectors derivations aligned with UHS and PMC standards.',
      priority: 'normal',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [userProgress, setUserProgress] = useState<LessonProgress[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Sync route with browser history
  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial Seed & Data Fetching
  const loadPortalData = useCallback(async () => {
    try {
      await seedInitialPortalDataIfEmpty();

      // Fetch subjects
      try {
        const subList = await fetchSubjects();
        if (subList && subList.length > 0) {
          setSubjects(subList);
        }
      } catch {
        setSubjects(INITIAL_SUBJECTS);
      }

      // Fetch chapters
      try {
        const chapList = await fetchChapters();
        if (chapList && chapList.length > 0) {
          setChapters(chapList);
        }
      } catch {
        setChapters(INITIAL_CHAPTERS);
      }

      // Fetch courses
      let courseList: Course[] = [];
      try {
        if (isAdmin) {
          courseList = await fetchAllCoursesAdmin();
        } else {
          courseList = await fetchPublishedCourses();
        }
      } catch {
        courseList = INITIAL_COURSES;
      }
      if (courseList && courseList.length > 0) {
        setCourses(courseList);
      }

      // Fetch lessons
      try {
        const snap = await getDocs(collection(db, 'lessons'));
        if (!snap.empty) {
          const lList = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lesson, 'id'>) }));
          setLessons(lList);
        }
      } catch {
        // Fallback to initial lessons
      }

      // Fetch announcements
      try {
        const annList = await fetchAnnouncements();
        if (annList && annList.length > 0) {
          setAnnouncements(annList);
        }
      } catch {
        // Keep initial announcements
      }

      // Fetch site settings
      try {
        const settings = await fetchSiteSettings();
        if (settings) {
          setSiteSettings(settings);
        }
      } catch {
        // Keep initial
      }
    } catch (err) {
      console.warn('Data initialization notice:', err);
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Load progress when user logs in
  useEffect(() => {
    if (user) {
      fetchUserProgress(user.uid)
        .then((progs) => {
          if (progs) setUserProgress(progs);
        })
        .catch(() => {});
    } else {
      setUserProgress([]);
    }
  }, [user]);

  const handleProgressUpdated = (updatedProg: LessonProgress) => {
    setUserProgress((prev) => {
      const exists = prev.some((p) => p.lessonId === updatedProg.lessonId);
      if (exists) {
        return prev.map((p) => (p.lessonId === updatedProg.lessonId ? updatedProg : p));
      }
      return [...prev, updatedProg];
    });
  };

  // Route Parser
  const renderRoute = () => {
    // Exact match for root
    if (currentRoute === '/') {
      return <LandingPage courses={courses} navigate={navigate} />;
    }

    if (currentRoute === '/register') {
      return <RegisterPage navigate={navigate} />;
    }

    if (currentRoute === '/login') {
      return <LoginPage navigate={navigate} />;
    }

    if (currentRoute === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }

    if (currentRoute === '/application-status') {
      return <ApplicationStatusPage navigate={navigate} supportPhone={siteSettings.supportPhone} />;
    }

    if (currentRoute === '/subjects') {
      return (
        <SubjectsPage
          subjects={subjects}
          chapters={chapters}
          lessons={lessons}
          userProgress={userProgress}
          navigate={navigate}
        />
      );
    }

    if (currentRoute === '/membership') {
      return <MembershipPage siteSettings={siteSettings} navigate={navigate} />;
    }

    if (currentRoute === '/payment') {
      return <PaymentPage siteSettings={siteSettings} navigate={navigate} />;
    }

    if (currentRoute === '/courses') {
      return <CoursesPage courses={courses} navigate={navigate} />;
    }

    if (currentRoute.startsWith('/courses/')) {
      const courseId = currentRoute.replace('/courses/', '');
      return (
        <CourseDetailPage
          courseId={courseId}
          courses={courses}
          lessons={lessons}
          userProgress={userProgress}
          navigate={navigate}
        />
      );
    }

    if (currentRoute.startsWith('/learn/')) {
      const lessonId = currentRoute.replace('/learn/', '');
      return (
        <LearnPage
          lessonId={lessonId}
          courses={courses}
          lessons={lessons}
          userProgress={userProgress}
          onProgressUpdated={handleProgressUpdated}
          navigate={navigate}
        />
      );
    }

    if (currentRoute === '/dashboard') {
      return (
        <DashboardPage
          courses={courses}
          lessons={lessons}
          userProgress={userProgress}
          announcements={announcements}
          navigate={navigate}
        />
      );
    }

    if (currentRoute === '/my-progress') {
      return (
        <ProgressPage
          courses={courses}
          lessons={lessons}
          userProgress={userProgress}
          navigate={navigate}
        />
      );
    }

    if (currentRoute === '/profile') {
      return <ProfilePage navigate={navigate} />;
    }

    if (currentRoute === '/announcements') {
      return <AnnouncementsPage announcements={announcements} navigate={navigate} />;
    }

    if (currentRoute === '/admin-login') {
      return <AdminLoginPage navigate={navigate} />;
    }

    if (currentRoute.startsWith('/admin')) {
      if (authLoading) {
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">Verifying administrator clearance...</p>
          </div>
        );
      }

      if (!user) {
        return <AdminLoginPage navigate={navigate} />;
      }

      if (!isAdmin) {
        return (
          <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative">
              <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-800">
                  403 Forbidden Access
                </span>
                <h2 className="text-2xl font-extrabold text-white">
                  Administrator Clearance Required
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The account <strong className="text-white">{user.email}</strong> is not authorized to access the Administrator Control Panel. Ordinary student accounts are restricted from administrative functions.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Go to Student Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin-login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
                >
                  Admin Portal Login
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <AdminPage
          courses={courses}
          lessons={lessons}
          announcements={announcements}
          siteSettings={siteSettings}
          subjects={subjects}
          chapters={chapters}
          onRefreshData={loadPortalData}
          navigate={navigate}
        />
      );
    }

    // Default Fallback
    return <LandingPage courses={courses} navigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        announcementText={siteSettings.announcementBanner}
      />
      <main className="flex-1">{renderRoute()}</main>
      <Footer
        navigate={navigate}
        supportPhone={siteSettings.supportPhone}
        supportEmail={siteSettings.supportEmail}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
