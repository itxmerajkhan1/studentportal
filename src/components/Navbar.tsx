import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Bell,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  LayoutDashboard,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { IlmoraLogo } from './IlmoraLogo';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  announcementText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, announcementText }) => {
  const { user, profile, isAdmin, isApproved, isPending, isRejected, isSuspended, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logoutUser();
    navigate('/');
  };

  const handleMobileNav = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const getStatusBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Admin
        </span>
      );
    }
    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800">
          <CheckCircle className="w-3 h-3 text-emerald-400" /> Approved
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800">
          <Clock className="w-3 h-3 text-amber-400" /> Under Review
        </span>
      );
    }
    if (isRejected || isSuspended) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/80 text-rose-300 border border-rose-800">
          <ShieldAlert className="w-3 h-3 text-rose-400" /> Restricted
        </span>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100 shadow-sm transition-colors">
      {/* Top Banner Ticker */}
      {announcementText && (
        <div className="bg-slate-900 border-b border-slate-800/90 text-slate-300 px-3 sm:px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-medium truncate text-[11px] sm:text-xs text-slate-200">
                {announcementText}
              </span>
            </div>
            <button
              onClick={() => navigate('/announcements')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 shrink-0 cursor-pointer text-[11px]"
            >
              Details
            </button>
          </div>
        </div>
      )}

      {/* Main Bar: Strict 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Official ILMORA Brand Wordmark & Emblem */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer group select-none shrink-0"
        >
          <IlmoraLogo
            variant="full"
            theme="light"
            size="md"
            className="hidden sm:inline-flex"
          />
          <IlmoraLogo
            variant="full"
            theme="light"
            size="sm"
            className="sm:hidden"
          />
        </div>

        {/* Zone 2: Desktop Navigation Links (single-line, clean text) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => navigate('/')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentRoute === '/'
                ? 'text-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/subjects')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentRoute === '/subjects'
                ? 'text-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Subjects</span>
          </button>
          <button
            onClick={() => navigate('/courses')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentRoute.startsWith('/courses')
                ? 'text-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => navigate('/membership')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentRoute === '/membership' || currentRoute === '/payment'
                ? 'text-amber-400 font-semibold'
                : 'hover:text-amber-300'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Membership</span>
          </button>
          <button
            onClick={() => navigate('/announcements')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentRoute === '/announcements'
                ? 'text-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Notices
          </button>

          {/* Student Dashboard link when signed in */}
          {user && (
            <button
              onClick={() => {
                if (isPending || isRejected || isSuspended) {
                  navigate('/application-status');
                } else {
                  navigate('/dashboard');
                }
              }}
              className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentRoute === '/dashboard' || currentRoute === '/application-status'
                  ? 'text-cyan-400 font-semibold'
                  : 'hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{isPending ? 'Admission Status' : 'My Dashboard'}</span>
            </button>
          )}

          {/* Admin Panel button when verified admin */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentRoute.startsWith('/admin')
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/25'
                  : 'text-cyan-400 bg-cyan-950/60 border border-cyan-800 hover:bg-cyan-900/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Desktop User Profile / Auth Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs max-w-[120px] truncate">
                  <p className="font-semibold text-slate-200 truncate">{profile?.fullName || user.email}</p>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-[11px] text-slate-400">Signed in as</p>
                    <p className="text-xs font-bold text-white truncate">{user.email}</p>
                    <div className="mt-1">{getStatusBadge()}</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" /> Student Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/subjects');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-cyan-400" /> Subjects & Chapters
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/my-progress');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Learning Progress
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/membership');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Annual Membership
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" /> Account Profile
                    </button>
                  </div>

                  {isAdmin && (
                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-cyan-300 hover:bg-cyan-950/40 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Admin Control Panel
                      </button>
                    </div>
                  )}

                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 rounded-lg shadow-md shadow-cyan-500/20 transition cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header Controls: Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <button
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              className="text-[11px] font-bold px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300"
            >
              {isAdmin ? 'Admin' : 'Dashboard'}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition touch-target flex items-center justify-center cursor-pointer"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Full-Screen / Drawer Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bottom-0 bg-slate-950/98 backdrop-blur-xl z-50 overflow-y-auto px-5 py-6 flex flex-col justify-between border-t border-slate-800 animate-fade-in">
          <div className="space-y-4">
            {/* Quick Status if logged in */}
            {user && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[200px]">{profile?.fullName || user.email}</p>
                  <p className="text-[11px] text-slate-400">{profile?.academicLevel || 'Registered Student'}</p>
                </div>
                <div>{getStatusBadge()}</div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              <button
                onClick={() => handleMobileNav('/')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  currentRoute === '/' ? 'bg-slate-900 text-cyan-400 font-semibold' : 'text-slate-200 hover:bg-slate-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleMobileNav('/subjects')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-between ${
                  currentRoute === '/subjects' ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800' : 'text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Chapter-Wise Subjects</span>
                </div>
                <span className="text-[11px] text-cyan-400 font-normal">Class 11 & 12</span>
              </button>
              <button
                onClick={() => handleMobileNav('/courses')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  currentRoute.startsWith('/courses') ? 'bg-slate-900 text-cyan-400 font-semibold' : 'text-slate-200 hover:bg-slate-900'
                }`}
              >
                All Courses Catalog
              </button>
              <button
                onClick={() => handleMobileNav('/membership')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-between ${
                  currentRoute === '/membership' ? 'bg-amber-950/60 text-amber-300 border border-amber-800' : 'text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Annual Membership</span>
                </div>
                <span className="text-[11px] text-amber-300 font-bold">Rs. 1,000</span>
              </button>
              <button
                onClick={() => handleMobileNav('/announcements')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  currentRoute === '/announcements' ? 'bg-slate-900 text-cyan-400 font-semibold' : 'text-slate-200 hover:bg-slate-900'
                }`}
              >
                Board Notices & Circulars
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => handleMobileNav('/dashboard')}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-cyan-300 hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    <span>Student Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleMobileNav('/my-progress')}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>My Learning Progress</span>
                  </button>
                  <button
                    onClick={() => handleMobileNav('/profile')}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Student Profile</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleMobileNav('/admin')}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800 flex items-center gap-2 cursor-pointer mt-2"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Bottom Actions on Mobile */}
          <div className="pt-6 border-t border-slate-900 space-y-3 pb-8">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl bg-rose-950/50 hover:bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out from Portal</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleMobileNav('/login')}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-semibold text-xs text-center transition cursor-pointer"
                >
                  Student Login
                </button>
                <button
                  onClick={() => handleMobileNav('/register')}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 font-bold text-xs text-center shadow-md transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
            <p className="text-[10px] text-center text-slate-400">
              © {new Date().getFullYear()} ILMORA • Learn Today. Lead Tomorrow.
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
