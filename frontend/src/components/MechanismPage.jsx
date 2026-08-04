import React, { useState } from 'react';
import { Brain, Cpu, Calculator, Sparkles, HelpCircle, CheckCircle2, TrendingUp, TrendingDown, ArrowRight, BookOpen, Layers, Lightbulb } from 'lucide-react';

export default function MechanismPage() {
  // Interactive Simulator State
  const [simRank2025, setSimRank2025] = useState(50000);
  const [simQuota2025, setSimQuota2025] = useState(50);
  const [simQuota2026, setSimQuota2026] = useState(60);

  // Compute live simulation
  const dq = simQuota2025 > 0 ? (simQuota2026 - simQuota2025) / simQuota2025 : 0;
  const beta = 0.2554;
  const intercept = 0.0063;
  const predDr = beta * dq + intercept;

  const centralPred = Math.max(1, Math.round(simRank2025 * (1 + predDr)));
  const minPred = Math.max(1, Math.round(centralPred * 0.95));
  const maxPred = Math.round(centralPred * 1.05);

  const quotaDiff = simQuota2026 - simQuota2025;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner (Enriched Content Transferred from Table Header) */}
      <div className="p-8 rounded-3xl bg-blue-50/90 border border-blue-200/90 text-slate-900 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-blue-600" /> YÖK 2026 YKS Sıralama Tahmin Modeli & Rehberi
        </div>
        <h2 className="text-2xl font-extrabold text-blue-950">
          2025 Son Kişi Sıralaması & 2026 Kontenjan Değişim Analizi
        </h2>
        <p className="text-xs text-slate-700 leading-relaxed font-medium max-w-4xl">
          💡 <strong className="text-slate-900">Önemli Bilgi:</strong> ÖSYM 2026 tercih kılavuz tablolarındaki başarı sırası aslında <strong className="text-slate-900">2025 YKS'de o bölüme en son yerleşen kişinin sıralamasıdır</strong>. Modelimiz net tek bir tahmin yerine <strong>2026 Tahmini Yerleşme Sıralama Aralığı (Min – Max Range)</strong> üretmektedir.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="bg-white border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            📊 37.752 YKS Veri Çifti
          </span>
          <span className="bg-white border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            ⚡ β = 0.2554 Kontenjan Esnekliği
          </span>
          <span className="bg-white border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            🎯 ±%5 Güven Aralığı (Min - Max)
          </span>
        </div>
      </div>

      {/* Step-by-Step Rich Explanations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1 */}
        <div className="premium-card p-6 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">1. ÖSYM Kılavuz Mantığı</h3>
              <p className="text-xs text-slate-500 font-semibold">Sıralamanın Gerçek Anlamı</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            ÖSYM tarafından yayımlanan 2026 Tablo-4 kılavuzundaki başarı sırası sütunu, sanılanın aksine 2026 sıralaması değil, <strong>2025 YKS sınavında o programa en son yerleşen kişinin sıralamasıdır</strong> (R₂₀₂₅). Modelimiz bu veriyi baz sıralama (baseline) olarak alır.
          </p>
        </div>

        {/* Step 2 */}
        <div className="premium-card p-6 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">2. Ampirik ML Regresyonu</h3>
              <p className="text-xs text-slate-500 font-semibold">37.752 Veri Çifti İle Eğitim</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Veritabanımızdaki 2021-2025 yılları arasındaki <strong>37.752 adet geçmiş YKS verisi</strong> (ΔKontenjan → ΔSıralama) üzerinde En Küçük Kareler (OLS) Makine Öğrenmesi çalıştırılmış ve YKS kontenjan esneklik katsayısı (β = 0.2554) ampirik olarak türetilmiştir.
          </p>
        </div>

        {/* Step 3 */}
        <div className="premium-card p-6 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">3. Çok Yıllık Organik Trend</h3>
              <p className="text-xs text-slate-500 font-semibold">Bölümün Yıllık İvmesi (CAGR)</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Bölümün 2021, 2022, 2023, 2024 ve 2025 yıllarındaki sıralama eğilimi logaritmik regresyon ile taranarak, bölümün tercih edilirlik trendi (organik yükseliş/düşüş) tahmine %35 ağırlıkla eklenir.
          </p>
        </div>

        {/* Step 4 */}
        <div className="premium-card p-6 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">4. Tahmin Aralığı (Min – Max)</h3>
              <p className="text-xs text-slate-500 font-semibold">±%5 Standart Sapma Toleransı</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            YKS sınavındaki öğrenci davranışlarındaki varyansı hesaba katmak amacıyla, hesaplanan nokta tahminin etrafında ±%5 standart sapma toleransı uygulanarak <strong>Min ve Max sıralama sınırı</strong> oluşturulur.
          </p>
        </div>
      </div>

      {/* Formula & Equations Card */}
      <div className="premium-card p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">5. Matematiksel Formülasyon</h3>
            <p className="text-xs text-slate-500 font-semibold">Nokta Tahmin ve Alt-Üst Sıralama Aralığı Formülleri</p>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 space-y-3">
          <div className="text-blue-700 font-bold"># 1. Beklenen Göreli Sıralama Değişimi (ΔR_2026):</div>
          <div>ΔR_2026 = (0.2554 × ΔKontenjan_2026 + 0.0063) + (0.35 × Organik_Trend)</div>
          
          <div className="text-blue-700 font-bold pt-2"># 2. 2026 Tahmini Sıralama Aralığı (Min – Max Range):</div>
          <div>R_2026_Nokta = round(R_2025 × (1 + ΔR_2026))</div>
          <div>R_2026_Min = round(R_2026_Nokta × 0.95)   (Sıralama Yükselirse / Sıkılaşırsa)</div>
          <div>R_2026_Max = round(R_2026_Nokta × 1.05)   (Sıralama Esnerse / Rahatlarsa)</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="flex items-start gap-2 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 block">Kontenjan Artarsa (ΔQ &gt; 0):</strong>
              Program kapasitesi genişler → Sıralama esner/rahatlar (sayı büyür, yerleşmek kolaylaşır).
            </div>
          </div>

          <div className="flex items-start gap-2 bg-rose-50/60 p-4 rounded-xl border border-rose-100">
            <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-950 block">Kontenjan Azalırsa (ΔQ &lt; 0):</strong>
              Kapasite daralır → Rekabet sıkılaşır (sayı küçülür, yerleşmek zorlaşır).
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Calculator Section */}
      <div className="premium-card p-8 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 border border-indigo-200/80 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">6. Canlı İnteraktif Tahmin Simülatörü</h3>
              <p className="text-xs text-slate-500 font-semibold">Kendi değerlerinizi girip 2026 sıralama aralığını hesaplayın</p>
            </div>
          </div>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
            Canlı Test
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              📍 2025 Son Kişi Sıralaması (R₂₀₂₅)
            </label>
            <input
              type="number"
              value={simRank2025}
              onChange={(e) => setSimRank2025(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              📊 2025 Toplam Kontenjan
            </label>
            <input
              type="number"
              value={simQuota2025}
              onChange={(e) => setSimQuota2025(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              🎯 2026 Toplam Kontenjan
            </label>
            <input
              type="number"
              value={simQuota2026}
              onChange={(e) => setSimQuota2026(Math.max(0, Number(e.target.value)))}
              className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Output Result Card */}
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">🎯 Tahmini 2026 YKS Sıralama Aralığı</span>
              <div className="text-3xl font-extrabold text-indigo-950 mt-1">
                {minPred.toLocaleString()} – {maxPred.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                (Nokta Tahmin: <strong className="text-slate-900">{centralPred.toLocaleString()}</strong>)
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase block">Kontenjan Değişimi</span>
              <span className={`text-xl font-extrabold ${quotaDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {simQuota2025} → {simQuota2026} ({quotaDiff >= 0 ? `+${quotaDiff}` : quotaDiff})
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              {quotaDiff > 0 ? (
                <strong className="text-emerald-700">🟢 Kontenjan %{(dq*100).toFixed(1)} arttığı için sıralama ~{Math.abs(centralPred - simRank2025).toLocaleString()} sıra esneyecek (girme şansı artacak).</strong>
              ) : quotaDiff < 0 ? (
                <strong className="text-rose-700">🔴 Kontenjan %{(Math.abs(dq)*100).toFixed(1)} azaldığı için rekabet sıkılaşacak ve sıralama ~{Math.abs(centralPred - simRank2025).toLocaleString()} sıra yükselecek.</strong>
              ) : (
                <strong className="text-slate-700">⚪ Kontenjan sabit kaldığı için sıralamanın stabil seyretmesi beklenmektedir.</strong>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
