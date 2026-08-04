import React from 'react';
import { Building2, GraduationCap, Target, Calendar, Sparkles } from 'lucide-react';

export default function StatCards({ summaryData, total2026 }) {
  const totalUni = summaryData ? summaryData.total_universities : 259;
  const totalProg = summaryData ? summaryData.total_programs : 16330;
  const quota2026 = total2026 || 402286;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Stat 1 */}
      <div className="premium-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-blue-600">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam Üniversite</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalUni}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Devlet, Vakıf & KKTC</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
          <Building2 className="w-6 h-6" />
        </div>
      </div>

      {/* Stat 2 */}
      <div className="premium-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-indigo-600">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aktif Program</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalProg.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Lisans & Önlisans</p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
          <GraduationCap className="w-6 h-6" />
        </div>
      </div>

      {/* Stat 3 */}
      <div className="premium-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-600">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">2026 Güncel Kontenjan</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{quota2026.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Toplam ÖSYM Kontenjanı</p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
          <Target className="w-6 h-6" />
        </div>
      </div>

      {/* Stat 4 */}
      <div className="premium-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-purple-600">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Veri Kapsamı</p>
          <h3 className="text-2xl font-extrabold text-purple-700 mt-1">2021 – 2026</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">6 Yıllık Veri Seti</p>
        </div>
        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
          <Calendar className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
