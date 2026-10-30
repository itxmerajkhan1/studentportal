import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  GraduationCap,
  Bell,
  BarChart,
  User,
  Shield,
  CreditCard,
  LogOut,
  X,
  Sparkles,
  Settings,
} from 'lucide-react';
import { IlmoraLogo } from './IlmoraLogo';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  isOpen,
  onClose,
}) => {
  const { user, profile, isAdmin, logoutUser } = useAuth();

  const handleNav = (route: string) => {
    navigate(route);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await logoutUser();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Subjects', route: '/subjects', icon: <Layers className="w-4 h-4" /> },
    { label: 'Courses', route: '/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Annual Membership', route: '/membership', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Notices & Circulars', route: '/announcements', icon: <Bell className="w-4 h-4" /> },
    { label: 'My Progress', route: '/progress', icon: <BarChart className="w-4 h-4" /> },
    { label: 'My Profile', route: '/profile', icon: <User className="w-4 h-4" /> },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Control Panel', route: '/admin', icon: <Shield className="w-4 h-4" /> });
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
            <div
              onClick={() => handleNav(user ? '/dashboard' : '/')}
              className="cursor-pointer flex items-center gap-2 group"
            >
              <IlmoraLogo variant="full" theme="light" size="sm" />
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              const isActive =
                currentRoute === item.route ||
                (item.route !== '/' && currentRoute.startsWith(item.route) && item.route !== '/dashboard');

              return (
                <button
                  key={item.route}
                  onClick={() => handleNav(item.route)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#FECF35] text-[#033D6B] font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <span className={isActive ? 'text-[#033D6B]' : 'text-slate-400'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile / Admin Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {user ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <div
                onClick={() => handleNav('/profile')}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-[#033D6B] border border-cyan-500/30 text-[#FECF35] flex items-center justify-center text-xs font-bold shrink-0">
                  {user.email?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-[#FECF35] transition">
                    {profile?.fullName || user.email?.split('@')[0] || 'Student'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {isAdmin ? 'Administrator' : profile?.academicLevel || 'Class 12'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => handleNav('/login')}
                className="w-full py-2 px-3 rounded-xl bg-[#FECF35] text-[#033D6B] text-xs font-bold hover:bg-[#ebd02f] transition shadow cursor-pointer text-center"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition cursor-pointer text-center"
              >
                Register Admission
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
