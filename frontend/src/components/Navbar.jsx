import React from 'react';
import { GraduationCap, Table, BarChart3, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="glass-header-light sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 text-white transform hover:scale-105 transition-transform">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                YÖK Veri Analitiği Platformu
              </h1>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 text-xs px-2.5 py-0.5 rounded-full font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Web 3.0
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                6 Yıllık Veri Tabanı (2021–2026)
              </span>
              <span>•</span>
              <span>70.818 İşlenen Kayıt</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'table'
                ? 'bg-white text-blue-700 shadow-md shadow-slate-200/60 border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Table className="w-4 h-4" /> Veri Tablosu
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'charts'
                ? 'bg-white text-blue-700 shadow-md shadow-slate-200/60 border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Grafikler & Analiz
          </button>
        </nav>
      </div>
    </header>
  );
}
