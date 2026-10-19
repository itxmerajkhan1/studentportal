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
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 text-xs font-semibold border border-cyan-800/50 mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Official Circulars</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Portal Notices & Exam Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Official circulars regarding board test series, past paper solutions, and holiday schedules.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'urgent', 'normal', 'info'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition cursor-pointer ${
                  filter === p ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Bell className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Announcements Found</h3>
            <p className="text-xs text-slate-500">There are currently no active notices in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        item.priority === 'urgent'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : item.priority === 'info'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
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
