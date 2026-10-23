import React from 'react';
import { GraduationCap, Phone, Mail, ShieldCheck, MapPin } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
  supportPhone?: string;
  supportEmail?: string;
}

export const Footer: React.FC<FooterProps> = ({
  navigate,
  supportPhone = '+92 300 1234567',
  supportEmail = 'support@merajlearning.pk',
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">Meraj Learning</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premier digital educational portal delivering chapter-wise concept lectures, exam problem solving, and curated notes for Pakistani students.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/40">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin-Verified Student Enrollment</span>
            </div>
          </div>

          {/* Academic Programs */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">
              Curricula & Boards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-cyan-400 cursor-pointer">
                  FSc Part 1 & 2 (Pre-Engineering)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-cyan-400 cursor-pointer">
                  FSc Part 1 & 2 (Pre-Medical)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-cyan-400 cursor-pointer">
                  ICS & Computer Science Stream
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-cyan-400 cursor-pointer">
                  MDCAT & ECAT Entry Test Modules
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-cyan-400 cursor-pointer">
                  Matric Class 9 & 10 (Science Group)
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-cyan-400 cursor-pointer">
                  Portal Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-cyan-400 cursor-pointer">
                  Lecture Directory
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/announcements')} className="hover:text-cyan-400 cursor-pointer">
                  Board Exam Announcements
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/register')} className="hover:text-cyan-400 cursor-pointer">
                  Student Registration Form
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/application-status')} className="hover:text-cyan-400 cursor-pointer">
                  Check Admission Approval Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin-login')}
                  className="hover:text-cyan-400 cursor-pointer flex items-center gap-1.5 text-slate-400"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Administrator Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Helpline */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">
              Student Helpline
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              For admission verification, password resets, or video playback inquiries:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <a href={`tel:${supportPhone}`} className="text-slate-200 hover:text-cyan-400 font-medium">
                  {supportPhone} (WhatsApp Help)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <a href={`mailto:${supportEmail}`} className="text-slate-200 hover:text-cyan-400">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Islamabad / Lahore / Karachi, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Meraj Learning Portal. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Dedicated online learning platform for Pakistani students.</span>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => navigate('/admin-login')}
              className="hover:text-cyan-400 text-slate-400 transition cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-cyan-500/80" />
              <span>Admin Gateway</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
