import React, { useState } from 'react';
import { Announcement } from '../types';
import { Bell, AlertTriangle, Info, Calendar, Sparkles } from 'lucide-react';

interface AnnouncementsPageProps {
  announcements: Announcement[];
  navigate: (route: string) => void;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ announcements, navigate }) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'normal' | 'info'>('all');

  const filtered = announcements.filter((a) => {
    if (!a.isActive) return false;
    if (filter === 'all') return true;
    return a.priority === filter;
  });

  return (
    <div className="bg-[#022544] text-[#FEFEFE] min-h-screen py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#FEFEFE]/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#033D6B] text-[#FECF35] text-xs font-medium border border-[#FECF35]/30 mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Official Circulars</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#FEFEFE] tracking-tight">
              Portal notices & exam alerts
            </h1>
            <p className="text-xs sm:text-sm text-[#FEFEFE]/70 mt-1">
              Official circulars regarding board test series, past paper solutions, and academic schedules.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#093D6C] p-1.5 rounded-lg border border-[#FEFEFE]/15 text-xs">
            {(['all', 'urgent', 'normal', 'info'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-3 py-1.5 rounded-md capitalize font-medium transition cursor-pointer ${
                  filter === p
                    ? 'bg-[#FECF35] text-[#033D6B]'
                    : 'text-[#FEFEFE]/80 hover:text-white hover:bg-[#033D6B]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-12 text-center space-y-3">
            <Bell className="w-12 h-12 text-[#FEFEFE]/30 mx-auto" />
            <h3 className="text-base font-heading font-semibold text-[#FEFEFE]">No announcements found</h3>
            <p className="text-xs text-[#FEFEFE]/60">There are currently no active notices in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-5 sm:p-6 shadow-sm space-y-3 hover:border-[#FECF35]/30 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                        item.priority === 'urgent'
                          ? 'bg-rose-950/80 text-rose-200 border border-rose-700/60'
                          : item.priority === 'info'
                          ? 'bg-[#033D6B] text-[#FEFEFE] border border-[#FEFEFE]/20'
                          : 'bg-[#022544] text-[#FECF35] border border-[#FECF35]/40'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <h3 className="text-sm sm:text-base font-heading font-semibold text-[#FEFEFE]">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#FEFEFE]/60">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#FEFEFE]/80 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
