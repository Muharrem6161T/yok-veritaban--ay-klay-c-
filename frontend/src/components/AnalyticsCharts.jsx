import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp, Building, Award, Calendar } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'];

export default function AnalyticsCharts() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/analytics/');
        setAnalyticsData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="premium-card p-16 text-center text-slate-500 rounded-3xl font-semibold">
        ⏳ 6 Yıllık Veri ve Grafik Analizi Yükleniyor...
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="premium-card p-16 text-center text-slate-500 rounded-3xl font-semibold">
        Analiz verisi alınamadı.
      </div>
    );
  }

  const { summary, yearly_trends, university_types } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="premium-card p-6 rounded-3xl border-l-4 border-l-blue-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Üniversite Dağılımı</span>
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{summary.total_universities}</h3>
          <p className="text-xs text-slate-500">Türlerine Göre YÖK Kapsamındaki Üniversiteler</p>
        </div>

        <div className="premium-card p-6 rounded-3xl border-l-4 border-l-indigo-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Bölüm & Programlar</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{summary.total_programs.toLocaleString()}</h3>
          <p className="text-xs text-slate-500">Lisans ve Önlisans Programları</p>
        </div>

        <div className="premium-card p-6 rounded-3xl border-l-4 border-l-emerald-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">İşlenen Kontenjan Verisi</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-emerald-700">{summary.total_records.toLocaleString()}</h3>
          <p className="text-xs text-slate-500">6 Yıllık (2021-2026) Veri Kaydı</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6-Year Quota Trends Bar Chart */}
        <div className="premium-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" /> 6 Yıllık Toplam Kontenjan Trendi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">2021 – 2026 ÖSYM Kontenjan Değişimi</p>
            </div>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              6 Yıl Trend
            </span>
          </div>

          <div className="h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearly_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Bar dataKey="total_quota" name="Toplam Kontenjan" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* University Types Pie Chart */}
        <div className="premium-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" /> Üniversite Türü Dağılımı
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Devlet, Vakıf & KKTC Oranları</p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
              259 Üniversite
            </span>
          </div>

          <div className="h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={university_types}
                  dataKey="count"
                  nameKey="uni_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={5}
                  label={({ uni_type, percent }) => `${uni_type} (${(percent * 100).toFixed(0)}%)`}
                >
                  {university_types.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
