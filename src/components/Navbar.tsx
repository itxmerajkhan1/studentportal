import React, { useState } from 'react';
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
  PhoneCall,
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  announcementText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, announcementText }) => {
  const { user, profile, isAdmin, isApproved, isPending, isRejected, isSuspended, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logoutUser();
    navigate('/');
  };

  const getStatusBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-900/40 text-cyan-300 border border-cyan-500/30">
          <Sparkles className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3" /> Approved
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3" /> Pending Review
        </span>
      );
    }
    if (isRejected || isSuspended) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/40 text-rose-300 border border-rose-500/30">
          <ShieldAlert className="w-3 h-3" /> Action Required
        </span>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner Ticker */}
      {announcementText && (
        <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-cyan-900 text-sky-100 px-4 py-1.5 text-xs text-center border-b border-sky-800/40 flex items-center justify-center gap-2">
          <Bell className="w-3.5 h-3.5 text-cyan-300 animate-pulse shrink-0" />
          <span className="font-medium truncate max-w-4xl">{announcementText}</span>
          <button
            onClick={() => navigate('/announcements')}
            className="underline underline-offset-2 hover:text-white font-semibold ml-1 cursor-pointer shrink-0"
          >
            View Details
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                Meraj Learning
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5">Online Lecture & Curriculum Hub</p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => navigate('/')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              currentRoute === '/'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/courses')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              currentRoute.startsWith('/courses')
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => navigate('/announcements')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              currentRoute === '/announcements'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Notices
          </button>

          {/* If user logged in, show Dashboard link */}
          {user && (
            <button
              onClick={() => {
                if (isPending || isRejected || isSuspended) {
                  navigate('/application-status');
                } else {
                  navigate('/dashboard');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                currentRoute === '/dashboard' || currentRoute === '/application-status'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isPending ? 'Application Status' : 'My Portal'}</span>
            </button>
          )}

          {/* Admin link if admin */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentRoute.startsWith('/admin')
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Right Action / Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow">
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs max-w-[130px] truncate">
                  <p className="font-semibold text-slate-200 truncate">{profile?.fullName || user.email}</p>
                  <div className="flex items-center gap-1">{getStatusBadge()}</div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    <p className="text-xs text-cyan-400 font-medium mt-0.5">{profile?.academicLevel || 'Student'}</p>
                  </div>

                  {isApproved && (
                    <>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/my-progress');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-cyan-400" /> Learning Progress
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-cyan-400" /> My Profile
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/application-status');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-amber-400" /> Application Status
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-950/40 flex items-center gap-2 cursor-pointer font-medium border-t border-slate-800"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" /> Admin Management
                    </button>
                  )}

                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-1.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg shadow-md shadow-cyan-500/20 transition cursor-pointer"
              >
                Register as Student
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <button
              onClick={() => navigate('/application-status')}
              className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-cyan-300"
            >
              {profile?.status || 'Status'}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/courses');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Courses Catalog
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/announcements');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Notices & Announcements
          </button>

          {user ? (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="px-3 py-1 text-xs text-slate-400">
                Logged in as <span className="text-white font-medium">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-cyan-400 bg-slate-800/60"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/application-status');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-300 hover:bg-slate-800"
              >
                Application Status
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/my-progress');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                My Progress
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Profile
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800"
                >
                  Admin Management
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-2 text-center text-sm font-semibold rounded-lg bg-slate-800 text-white"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/register');
                }}
                className="w-full py-2 text-center text-sm font-semibold rounded-lg bg-cyan-400 text-slate-950"
              >
                Register as Student
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
