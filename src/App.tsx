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
import { Course, Lesson, LessonProgress, Announcement, SiteSettings } from './types';
import {
  db,
  fetchPublishedCourses,
  fetchAllCoursesAdmin,
  fetchAnnouncements,
  fetchSiteSettings,
  fetchUserProgress,
} from './firebase/config';
import { seedInitialPortalDataIfEmpty, INITIAL_SETTINGS, INITIAL_COURSES, INITIAL_LESSONS } from './firebase/seedData';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';

function MainApp() {
  const { user, isAdmin, isApproved, isPending, loading: authLoading } = useAuth();

  // Navigation route state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
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

    if (currentRoute.startsWith('/admin')) {
      return (
        <AdminPage
          courses={courses}
          lessons={lessons}
          announcements={announcements}
          siteSettings={siteSettings}
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
