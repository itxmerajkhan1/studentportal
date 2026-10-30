import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Sparkles,
  CheckCircle,
  Clock,
  Shield,
  BookOpen,
} from 'lucide-react';
import { IlmoraLogo } from './IlmoraLogo';

interface HeaderBarProps {
  onToggleSidebar: () => void;
  navigate: (route: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onToggleSidebar,
  navigate,
  searchQuery = '',
  onSearchChange,
}) => {
  const { user, profile, isAdmin, isApproved, isPending, logoutUser } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logoutUser();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 transition-colors">
      {/* Left Area: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (like reference image) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search courses, lectures, topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#033D6B]/20 focus:border-[#033D6B] transition"
          />
        </form>
      </div>

      {/* Right Area: Status Badge, Notifications, User Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Status Chip */}
        {isAdmin && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FECF35]/20 text-[#033D6B] border border-[#FECF35]/40">
            <Sparkles className="w-3 h-3 text-[#033D6B]" />
            <span>Admin</span>
          </span>
        )}
        {!isAdmin && isApproved && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Approved Student</span>
          </span>
        )}
        {!isAdmin && isPending && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Under Review</span>
          </span>
        )}

        {/* Notifications Icon Button */}
        <button
          onClick={() => navigate('/announcements')}
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative cursor-pointer"
          title="Notices & Circulars"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#FECF35] absolute top-1.5 right-1.5" />
        </button>

        {/* User Account Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#033D6B] text-[#FECF35] font-bold text-xs flex items-center justify-center border border-slate-200 shadow-xs">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">
                    {profile?.fullName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/membership');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Membership</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[#033D6B] font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#033D6B]" />
                      <span>Admin Control</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-full bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition shadow-xs cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
