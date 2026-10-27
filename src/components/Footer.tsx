import React from 'react';
import { GraduationCap, Phone, Mail, ShieldCheck, MapPin } from 'lucide-react';
import { OFFICIAL_CONTACT_PHONE, PUBLIC_CONTACT_EMAIL, OFFICIAL_WHATSAPP_URL } from '../config/constants';
import { IlmoraLogo } from './IlmoraLogo';

interface FooterProps {
  navigate: (route: string) => void;
  supportPhone?: string;
  supportEmail?: string;
}

export const Footer: React.FC<FooterProps> = ({
  navigate,
  supportPhone = OFFICIAL_CONTACT_PHONE,
  supportEmail = PUBLIC_CONTACT_EMAIL,
}) => {
  return (
    <footer className="bg-[#022340] text-[#FEFEFE]/80 border-t border-[#FEFEFE]/15 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div
              onClick={() => navigate('/')}
              className="flex items-center cursor-pointer group"
            >
              <IlmoraLogo variant="full" theme="light" size="md" />
            </div>
            <p className="text-xs text-[#FEFEFE]/80 leading-relaxed">
              Premier educational technology platform delivering chapter-wise concept lectures, exam problem solving, and curated notes. Learn Today. Lead Tomorrow.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#FECF35] bg-[#FECF35]/10 p-2.5 rounded-lg border border-[#FECF35]/30">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#FECF35]" />
              <span className="font-medium">Admin-verified student enrollment</span>
            </div>
          </div>

          {/* Academic Programs */}
          <div>
            <h4 className="text-sm font-semibold text-[#FEFEFE] tracking-normal mb-3 font-heading">
              Curricula & boards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-[#FECF35] transition cursor-pointer">
                  FSc Part 1 & 2 (Pre-Engineering)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-[#FECF35] transition cursor-pointer">
                  FSc Part 1 & 2 (Pre-Medical)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-[#FECF35] transition cursor-pointer">
                  ICS & Computer Science Stream
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-[#FECF35] transition cursor-pointer">
                  MDCAT & ECAT Entry Test Modules
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-[#FECF35] transition cursor-pointer">
                  Matric Class 9 & 10 (Science Group)
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-sm font-semibold text-[#FEFEFE] tracking-normal mb-3 font-heading">
              Quick links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-[#FECF35] transition cursor-pointer">
                  Portal home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-[#FECF35] transition cursor-pointer">
                  Lecture directory
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/announcements')} className="hover:text-[#FECF35] transition cursor-pointer">
                  Board exam announcements
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/register')} className="hover:text-[#FECF35] transition cursor-pointer">
                  Student registration form
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/application-status')} className="hover:text-[#FECF35] transition cursor-pointer">
                  Check admission approval status
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin-login')}
                  className="hover:text-[#FECF35] transition cursor-pointer flex items-center gap-1.5 text-[#FEFEFE]/80"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FECF35]" />
                  <span>Administrator portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Helpline */}
          <div>
            <h4 className="text-sm font-semibold text-[#FEFEFE] tracking-normal mb-3 font-heading">
              Student helpline
            </h4>
            <p className="text-xs text-[#FEFEFE]/75 mb-3">
              For admission verification, password resets, or video playback inquiries:
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FECF35]" />
                <a
                  href={OFFICIAL_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FEFEFE] hover:text-[#FECF35] transition font-medium"
                >
                  {supportPhone} (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FECF35]" />
                <a href={`mailto:${supportEmail}`} className="text-[#FEFEFE] hover:text-[#FECF35] transition">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#FEFEFE]/70">
                <MapPin className="w-4 h-4 text-[#FECF35]" />
                <span>Islamabad / Lahore / Karachi, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#FEFEFE]/15 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FEFEFE]/70 gap-3">
          <p>© {new Date().getFullYear()} ILMORA. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-[#FEFEFE]/70">
            <span>ILMORA • Learn Today. Lead Tomorrow.</span>
            <span className="text-[#FEFEFE]/30">•</span>
            <button
              onClick={() => navigate('/admin-login')}
              className="hover:text-[#FECF35] text-[#FEFEFE]/70 transition cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-[#FECF35]" />
              <span>Admin gateway</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
