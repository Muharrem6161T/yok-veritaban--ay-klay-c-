import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function AIPrediction({ initialProgramId }) {
  const [programs, setPrograms] = useState([]);
  const [selectedProgId, setSelectedProgId] = useState(initialProgramId || '');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/programs/?limit=100').then((res) => {
      const list = res.data.results || [];
      setPrograms(list);
      if (!selectedProgId && list.length > 0) {
        setSelectedProgId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (initialProgramId) {
      setSelectedProgId(initialProgramId);
    }
  }, [initialProgramId]);

  const handleRunPredict = async () => {
    if (!selectedProgId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/predict/${selectedProgId}/`);
      setPrediction(res.data);
    } catch (err) {
      console.error('Error fetching prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProgId) {
      handleRunPredict();
    }
  }, [selectedProgId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Selection Panel */}
      <div className="premium-card p-8 rounded-3xl border-l-4 border-l-indigo-600 space-y-5 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100 shadow-sm">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Makine Öğrenmesi Tahmin Motoru
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Seçtiğiniz bölümün 6 yıllık (2021-2026) verilerini analiz ederek 2027 tahmini kontenjanını üretir.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
          <select
            value={selectedProgId}
            onChange={(e) => setSelectedProgId(e.target.value)}
            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.university_name} — {p.name} ({p.score_type})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunPredict}
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all shrink-0 hover:scale-105"
          >
            <Zap className="w-4 h-4 text-indigo-200" /> {loading ? 'Model Hesaplıyor...' : 'Yapay Zeka Analiz Et'}
          </button>
        </div>
      </div>

      {/* Prediction Output Panel */}
      {prediction && (
        <div className="premium-card p-8 rounded-3xl space-y-6 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              {prediction.university_name} • {prediction.city}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{prediction.program_name}</h3>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-bold">🎯 {prediction.prediction.target_year} Tahmini Kontenjan</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {prediction.prediction.predicted_quota} <span className="text-xs font-semibold text-slate-500">öğrenci</span>
              </div>
            </div>

            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-bold">📈 Beklenen Net Değişim</span>
              <div className={`text-3xl font-extrabold mt-2 ${
                prediction.prediction.quota_change_net >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {prediction.prediction.quota_change_net >= 0 ? `+${prediction.prediction.quota_change_net}` : prediction.prediction.quota_change_net}
                <span className="text-xs ml-2 font-bold">({prediction.prediction.quota_change_pct}%)</span>
              </div>
            </div>

            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-bold">🤖 Model Güven Skoru</span>
              <div className="text-3xl font-extrabold text-indigo-600 mt-2">
                %{(prediction.prediction.confidence_score * 100).toFixed(0)}
              </div>
            </div>
          </div>

          {/* AI Narrative Box */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50/50 p-5 rounded-2xl border border-indigo-100 flex items-start gap-4">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-950">Yapay Zeka Analiz Özeti</h4>
              <p className="text-xs text-indigo-900 mt-1 leading-relaxed font-medium">
                {prediction.prediction.ai_summary} Kontenjan eğilimi <strong>{prediction.prediction.trend_direction}</strong> yönünde seyretmektedir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
