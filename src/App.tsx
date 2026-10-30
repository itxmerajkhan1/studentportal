import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
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
} from './firebase/seedData';

function MainApp() {
  const { user, isAdmin, isApproved, isPending, loading: authLoading } = useAuth();

  // Navigation route state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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

  // Data Fetching directly from Firestore
  const loadPortalData = useCallback(async () => {
    try {
      await seedInitialPortalDataIfEmpty();

      try {
        const subList = await fetchSubjects();
        setSubjects(subList || []);
      } catch (err) {
        console.warn('Notice loading subjects:', err);
        setSubjects([]);
      }

      try {
        const chapList = await fetchChapters();
        setChapters(chapList || []);
      } catch (err) {
        console.warn('Notice loading chapters:', err);
        setChapters([]);
      }

      try {
        let courseList: Course[] = [];
        if (isAdmin) {
          courseList = (await fetchAllCoursesAdmin()) || [];
        } else {
          courseList = (await fetchPublishedCourses()) || [];
        }
        setCourses(courseList);
      } catch (err) {
        console.warn('Notice loading courses:', err);
        setCourses([]);
      }

      try {
        const annList = await fetchAnnouncements();
        setAnnouncements(annList || []);
      } catch (err) {
        console.warn('Notice loading announcements:', err);
        setAnnouncements([]);
      }

      try {
        const settings = await fetchSiteSettings();
        if (settings) {
          setSiteSettings(settings);
        }
      } catch (err) {
        console.warn('Notice loading settings:', err);
      }
    } catch (error) {
      console.error('Error fetching portal data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin]);

  // Fetch user progress when user changes
  const loadProgressData = useCallback(async () => {
    if (!user) {
      setUserProgress([]);
      return;
    }
    try {
      const prog = await fetchUserProgress(user.uid);
      setUserProgress(prog || []);
    } catch (err) {
      console.warn('Notice loading student progress:', err);
      setUserProgress([]);
    }
  }, [user]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const handleProgressUpdated = (updated: LessonProgress) => {
    setUserProgress((prev) => {
      const idx = prev.findIndex((p) => p.lessonId === updated.lessonId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
  };

  const isStandaloneRoute =
    currentRoute === '/' ||
    currentRoute === '/login' ||
    currentRoute === '/register' ||
    currentRoute === '/admin-login' ||
    currentRoute === '/forgot-password';

  const renderRoute = () => {
    if (loadingData && authLoading) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#033D6B] animate-spin" />
          <p className="text-xs text-slate-500 font-sans">Loading ILMORA Learning Portal...</p>
        </div>
      );
    }

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

    if (currentRoute === '/progress' || currentRoute === '/my-progress') {
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
            <Loader2 className="w-8 h-8 text-[#033D6B] animate-spin" />
            <p className="text-xs text-slate-500">Verifying administrator clearance...</p>
          </div>
        );
      }

      if (!user) {
        return <AdminLoginPage navigate={navigate} />;
      }

      if (!isAdmin) {
        return (
          <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 text-center space-y-6 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200">
                  403 Forbidden Access
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Administrator Clearance Required
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  The account <strong className="text-slate-900">{user.email}</strong> is not authorized to access the Administrator Control Panel.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  Go to Student Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin-login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition cursor-pointer"
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

  // For public standalone routes (Landing, Login, Register, Admin Login, Forgot Password)
  if (isStandaloneRoute) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#FECF35] selection:text-[#033D6B]">
        {currentRoute === '/' && (
          <Navbar
            currentRoute={currentRoute}
            navigate={navigate}
            announcementText={siteSettings.announcementBanner}
          />
        )}
        <main className="flex-1">{renderRoute()}</main>
      </div>
    );
  }

  // Unified Dashboard Shell for Authenticated & Portal Routes
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans selection:bg-[#FECF35] selection:text-[#033D6B]">
      {/* Dark Left Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        navigate={navigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <HeaderBar
          onToggleSidebar={() => setSidebarOpen(true)}
          navigate={navigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-x-hidden">{renderRoute()}</main>
      </div>
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
