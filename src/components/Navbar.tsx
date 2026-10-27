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

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  navigate,
  announcementText,
}) => {
  const { user, profile, isAdmin, isApproved, isPending, isRejected, isSuspended, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [userDropdownOpen]);

  // Prevent background scroll when mobile drawer is open
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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#FECF35]/20 text-[#FECF35] border border-[#FECF35]/40">
          <Sparkles className="w-3 h-3 text-[#FECF35]" /> Admin
        </span>
      );
    }
    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-200 border border-emerald-700/60">
          <CheckCircle className="w-3 h-3 text-emerald-300" /> Approved
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#FECF35]/15 text-[#FECF35] border border-[#FECF35]/30">
          <Clock className="w-3 h-3 text-[#FECF35]" /> Under Review
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-rose-950/80 text-rose-300 border border-rose-800">
          Rejected
        </span>
      );
    }
    if (isSuspended) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-rose-950/80 text-rose-300 border border-rose-800">
          Suspended
        </span>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#033D6B] border-b border-[#FEFEFE]/15 text-[#FEFEFE] shadow-sm transition-colors">
      {/* Top Banner Ticker */}
      {announcementText && (
        <div className="bg-[#093D6C] border-b border-[#FEFEFE]/10 text-[#FEFEFE] px-3 sm:px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-3.5 h-3.5 text-[#FECF35] shrink-0" />
              <span className="font-normal truncate text-[11px] sm:text-xs text-[#FEFEFE]">
                {announcementText}
              </span>
            </div>
            <button
              onClick={() => navigate('/announcements')}
              className="text-[#FECF35] hover:underline shrink-0 cursor-pointer text-[11px] font-medium"
            >
              Details
            </button>
          </div>
        </div>
      )}

      {/* Main Bar */}
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

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#FEFEFE]/90">
          <button
            onClick={() => navigate('/')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 ${
              currentRoute === '/'
                ? 'text-[#FECF35] font-semibold border-b-2 border-[#FECF35]'
                : 'hover:text-[#FECF35]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/subjects')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              currentRoute === '/subjects'
                ? 'text-[#FECF35] font-semibold border-b-2 border-[#FECF35]'
                : 'hover:text-[#FECF35]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Subjects</span>
          </button>
          <button
            onClick={() => navigate('/courses')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 ${
              currentRoute.startsWith('/courses')
                ? 'text-[#FECF35] font-semibold border-b-2 border-[#FECF35]'
                : 'hover:text-[#FECF35]'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => navigate('/membership')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              currentRoute === '/membership' || currentRoute === '/payment'
                ? 'text-[#FECF35] font-semibold border-b-2 border-[#FECF35]'
                : 'hover:text-[#FECF35]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#FECF35]" />
            <span>Membership</span>
          </button>
          <button
            onClick={() => navigate('/announcements')}
            className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 ${
              currentRoute === '/announcements'
                ? 'text-[#FECF35] font-semibold border-b-2 border-[#FECF35]'
                : 'hover:text-[#FECF35]'
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
              className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                currentRoute === '/dashboard' || currentRoute === '/application-status'
                  ? 'text-[#FECF35] font-semibold border-b-2 border-[#FECF35]'
                  : 'hover:text-[#FECF35]'
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
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentRoute.startsWith('/admin')
                  ? 'bg-[#FECF35] text-[#033D6B] font-semibold shadow-sm'
                  : 'text-[#033D6B] bg-[#FECF35] hover:bg-[#ebd02f]'
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
            <div className="relative user-dropdown-container">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#093D6C] hover:bg-[#0b487e] border border-[#FEFEFE]/15 transition cursor-pointer text-[#FEFEFE]"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-7 h-7 rounded bg-[#FECF35] text-[#033D6B] flex items-center justify-center font-semibold text-xs shadow-sm">
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs max-w-[120px] truncate">
                  <p className="font-medium text-[#FEFEFE] truncate">{profile?.fullName || user.email}</p>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl shadow-xl py-2 z-50 text-[#FEFEFE]">
                  <div className="px-4 py-2.5 border-b border-[#FEFEFE]/15">
                    <p className="text-[11px] text-[#FEFEFE]/70">Signed in as</p>
                    <p className="text-xs font-semibold text-[#FEFEFE] truncate">{user.email}</p>
                    <div className="mt-1.5">{getStatusBadge()}</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#FEFEFE]/90 hover:text-[#FECF35] hover:bg-[#033D6B] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#FECF35]" /> Student Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/subjects');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#FEFEFE]/90 hover:text-[#FECF35] hover:bg-[#033D6B] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#FECF35]" /> Subjects & Chapters
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/my-progress');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#FEFEFE]/90 hover:text-[#FECF35] hover:bg-[#033D6B] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#FECF35]" /> Learning Progress
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/membership');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#FEFEFE]/90 hover:text-[#FECF35] hover:bg-[#033D6B] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#FECF35]" /> Annual Membership
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#FEFEFE]/90 hover:text-[#FECF35] hover:bg-[#033D6B] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-[#FECF35]" /> Account Profile
                    </button>
                  </div>

                  {isAdmin && (
                    <div className="border-t border-[#FEFEFE]/15 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#FECF35] hover:bg-[#033D6B] flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FECF35]" /> Admin Control Panel
                      </button>
                    </div>
                  )}

                  <div className="border-t border-[#FEFEFE]/15 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium"
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
                className="px-3 py-1.5 text-xs font-medium text-[#FEFEFE] hover:text-[#FECF35] transition cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-1.5 text-xs font-medium text-[#033D6B] bg-[#FECF35] hover:bg-[#ebd02f] rounded-md shadow-sm transition cursor-pointer"
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
              className="text-[11px] font-medium px-2 py-1 rounded bg-[#093D6C] border border-[#FEFEFE]/20 text-[#FECF35]"
            >
              {isAdmin ? 'Admin' : 'Dashboard'}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-lg bg-[#093D6C] border border-[#FEFEFE]/20 text-[#FEFEFE] hover:text-[#FECF35] transition touch-target flex items-center justify-center cursor-pointer"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Full-Screen / Drawer Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bottom-0 bg-[#033D6B] z-50 overflow-y-auto px-5 py-6 flex flex-col justify-between border-t border-[#FEFEFE]/15 animate-fade-in text-[#FEFEFE]">
          <div className="space-y-4">
            {/* Quick Status if logged in */}
            {user && (
              <div className="p-3.5 rounded-xl bg-[#093D6C] border border-[#FEFEFE]/15 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white truncate max-w-[200px]">{profile?.fullName || user.email}</p>
                  <p className="text-[11px] text-[#FEFEFE]/70">{profile?.academicLevel || 'Registered Student'}</p>
                </div>
                <div>{getStatusBadge()}</div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              <button
                onClick={() => handleMobileNav('/')}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  currentRoute === '/' ? 'bg-[#093D6C] text-[#FECF35] font-semibold' : 'text-[#FEFEFE] hover:bg-[#093D6C]'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleMobileNav('/subjects')}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-between ${
                  currentRoute === '/subjects' ? 'bg-[#093D6C] text-[#FECF35] font-semibold' : 'text-[#FEFEFE] hover:bg-[#093D6C]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FECF35]" />
                  <span>Chapter-Wise Subjects</span>
                </div>
                <span className="text-[11px] text-[#FECF35]">Class 11 & 12</span>
              </button>
              <button
                onClick={() => handleMobileNav('/courses')}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  currentRoute.startsWith('/courses') ? 'bg-[#093D6C] text-[#FECF35] font-semibold' : 'text-[#FEFEFE] hover:bg-[#093D6C]'
                }`}
              >
                All Courses Catalog
              </button>
              <button
                onClick={() => handleMobileNav('/membership')}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-between ${
                  currentRoute === '/membership' ? 'bg-[#093D6C] text-[#FECF35] font-semibold' : 'text-[#FEFEFE] hover:bg-[#093D6C]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FECF35]" />
                  <span>Annual Membership</span>
                </div>
                <span className="text-[11px] text-[#FECF35] font-semibold">Rs. 1,000</span>
              </button>
              <button
                onClick={() => handleMobileNav('/announcements')}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  currentRoute === '/announcements' ? 'bg-[#093D6C] text-[#FECF35] font-semibold' : 'text-[#FEFEFE] hover:bg-[#093D6C]'
                }`}
              >
                Board Notices & Circulars
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => handleMobileNav('/dashboard')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#FEFEFE] hover:bg-[#093D6C] flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#FECF35]" />
                    <span>Student Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleMobileNav('/my-progress')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#FEFEFE] hover:bg-[#093D6C] flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#FECF35]" />
                    <span>My Learning Progress</span>
                  </button>
                  <button
                    onClick={() => handleMobileNav('/profile')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#FEFEFE] hover:bg-[#093D6C] flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#FECF35]" />
                    <span>Student Profile</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleMobileNav('/admin')}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#033D6B] bg-[#FECF35] flex items-center gap-2 cursor-pointer mt-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#033D6B]" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Bottom Actions on Mobile */}
          <div className="pt-6 border-t border-[#FEFEFE]/15 space-y-3 pb-8">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-lg bg-rose-950/60 hover:bg-rose-950 text-rose-200 border border-rose-800/60 font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out from Portal</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleMobileNav('/login')}
                  className="py-2.5 px-4 rounded-lg bg-transparent hover:bg-[#093D6C] text-[#FEFEFE] border border-[#FEFEFE]/30 font-medium text-xs text-center transition cursor-pointer"
                >
                  Student Login
                </button>
                <button
                  onClick={() => handleMobileNav('/register')}
                  className="py-2.5 px-4 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-xs text-center shadow-sm transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
            <p className="text-[11px] text-center text-[#FEFEFE]/70">
              © {new Date().getFullYear()} ILMORA • Learn Today. Lead Tomorrow.
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
