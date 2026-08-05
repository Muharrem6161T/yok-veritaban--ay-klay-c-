import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import DataTable from './components/DataTable';
import AnalyticsCharts from './components/AnalyticsCharts';
import axios from 'axios';

export default function App() {
  const [activeTab, setActiveTab] = useState('lisans');
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    axios.get('/api/analytics/').then((res) => {
      setSummaryData(res.data.summary);
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* KPI Top Stat Bar */}
        <StatCards summaryData={summaryData} />

        {/* Tab Views */}
        {activeTab === 'lisans' && (
          <DataTable defaultDegree="Lisans (4+ Yıl)" title="Lisans Programları (4+ Yıl - Tablo 4)" />
        )}

        {activeTab === 'onlisans' && (
          <DataTable defaultDegree="Önlisans (2 Yıl)" title="Önlisans Programları (2 Yıl - Tablo 3)" />
        )}

        {activeTab === 'charts' && (
          <AnalyticsCharts />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-semibold">
        YÖK Kontenjan Analiz Platformu • Lisans & Önlisans 6 Yıllık Veri Tabanı (2021-2026)
      </footer>
    </div>
  );
}
