import React, { useState, useEffect } from 'react';
import { Search, Target, TrendingUp, TrendingDown, Filter, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import axios from 'axios';

export default function RankingForecastPage() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  const [selectedScoreType, setSelectedScoreType] = useState('Tümü');

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        exact: exactMatch,
        score_types: selectedScoreType,
        limit: 350
      };
      const res = await axios.get('/api/ranking-forecasts/', { params });
      setForecasts(res.data.results || []);
    } catch (err) {
      console.error('Error fetching ranking forecasts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchForecasts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, exactMatch, selectedScoreType]);

  const totalCount = forecasts.length;
  const easierCount = forecasts.filter(f => f.status === 'easier').length;
  const harderCount = forecasts.filter(f => f.status === 'harder').length;

  return (
    <div className="space-y-6">
      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="premium-card p-5 rounded-2xl border-l-4 border-l-blue-600 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Analiz Edilen Bölüm</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="premium-card p-5 rounded-2xl border-l-4 border-l-emerald-600 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Sıralaması Esneyecek (Kolaylaşacak)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{easierCount} Bölüm</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="premium-card p-5 rounded-2xl border-l-4 border-l-rose-600 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Sıralaması Yükselecek (Zorlaşacak)</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{harderCount} Bölüm</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="premium-card p-5 rounded-3xl space-y-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-blue-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sıralama tahmini yapılacak bölüm adını yazın (Örn: Yazılım, Tıp, Hukuk, Mimarlık...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-10 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>

          {/* Exact match */}
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={exactMatch}
              onChange={(e) => setExactMatch(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>📌 Tam Eşleşme</span>
          </label>

          {/* Score Type Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedScoreType}
              onChange={(e) => setSelectedScoreType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600"
            >
              <option value="Tümü">Tüm Puan Türleri</option>
              <option value="SAY">SAY</option>
              <option value="EA">EA</option>
              <option value="SÖZ">SÖZ</option>
              <option value="DİL">DİL</option>
              <option value="TYT">TYT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ranking Forecast Table */}
      <div className="premium-card rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto max-h-[620px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/90 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="py-3.5 px-5">Üniversite Adı</th>
                <th className="py-3.5 px-5">Program / Bölüm Adı</th>
                <th className="py-3.5 px-3 text-center">Puan</th>
                <th className="py-3.5 px-4 text-right">2025 Yerleşen Son Sıralama</th>
                <th className="py-3.5 px-4 text-center">Kontenjan (2025 → 2026)</th>
                <th className="py-3.5 px-4 text-center bg-blue-50/80 text-blue-950 border-x border-blue-100">
                  🎯 2026 Tahmini Sıralama Aralığı (Min – Max)
                </th>
                <th className="py-3.5 px-4 text-center">Beklenen Sıra Kayması</th>
                <th className="py-3.5 px-4 text-center">Girme Şansı / Eğilim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400 font-semibold">
                    ⏳ 2026 Sıralama Tahmin Aralığı Hesaplanıyor...
                  </td>
                </tr>
              ) : forecasts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400 font-semibold">
                    Arama kriterlerine uygun sıralama tahmini bulunamadı.
                  </td>
                </tr>
              ) : (
                forecasts.map((f, idx) => {
                  const rank25Str = f.rank_2025 ? f.rank_2025.toLocaleString() : 'Dolmadı / Yok';
                  const rangeStr = f.rank_range_str || '-';
                  const shift = f.rank_shift;

                  return (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-5 font-bold text-slate-900">{f.university_name}</td>
                      <td className="py-3 px-5 text-blue-700 font-bold">{f.program_name}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-slate-700">{f.score_type}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {rank25Str}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        <span className="text-slate-600">{f.quota_2025}</span>
                        <span className="text-slate-400 mx-1.5">→</span>
                        <span className="font-bold text-slate-900">{f.quota_2026}</span>
                        <span className={`ml-2 font-bold ${
                          f.quota_diff > 0 ? 'text-emerald-600' : f.quota_diff < 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                          ({f.quota_diff > 0 ? `+${f.quota_diff}` : f.quota_diff})
                        </span>
                      </td>
                      {/* Predicted 2026 Rank Range Column */}
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-blue-900 bg-blue-50/50 border-x border-blue-100">
                        {rangeStr}
                      </td>
                      {/* Rank Shift */}
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {shift !== null ? (
                          shift > 0 ? (
                            <span className="text-emerald-600 flex items-center justify-center gap-1">
                              <ArrowDownRight className="w-4 h-4" /> +{shift.toLocaleString()} (Esneyecek)
                            </span>
                          ) : shift < 0 ? (
                            <span className="text-rose-600 flex items-center justify-center gap-1">
                              <ArrowUpRight className="w-4 h-4" /> {shift.toLocaleString()} (Yükselecek)
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center justify-center gap-1">
                              <Minus className="w-4 h-4" /> 0 (Değişmeyecek)
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      {/* Status Tag */}
                      <td className="py-3 px-4 text-center">
                        {f.status === 'easier' && (
                          <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-600" /> Kolaylaşacak
                          </span>
                        )}
                        {f.status === 'harder' && (
                          <span className="bg-rose-100 border border-rose-200 text-rose-800 px-3 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-rose-600" /> Zorlaşacak
                          </span>
                        )}
                        {f.status === 'stable' && (
                          <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full font-bold text-[10px]">
                            ⚪ Stabil
                          </span>
                        )}
                        {f.status === 'closed' && (
                          <span className="bg-rose-200 border border-rose-300 text-rose-900 px-3 py-1 rounded-full font-bold text-[10px]">
                            🚫 Kapatıldı
                          </span>
                        )}
                        {f.status === 'new' && (
                          <span className="bg-emerald-200 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-full font-bold text-[10px]">
                            🟢 Yeni Açıldı
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
