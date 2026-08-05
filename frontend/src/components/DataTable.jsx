import React, { useState, useEffect } from 'react';
import { Search, Download, XCircle, Sparkles, SlidersHorizontal } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import MultiSelectDropdown from './MultiSelectDropdown';

// Comprehensive Turkish Cities List
const CITIES_LIST = [
  'ADANA', 'ADIYAMAN', 'AFYONKARAHİSAR', 'AĞRI', 'AKSARAY', 'AMASYA', 'ANKARA', 'ANTALYA', 'ARDAHAN', 'ARTVİN',
  'AYDIN', 'BALIKESİR', 'BARTIN', 'BATMAN', 'BAYBURT', 'BİLECİK', 'BİNGÖL', 'BİTLİS', 'BOLU', 'BURDUR',
  'BURSA', 'ÇANAKKALE', 'ÇANKIRI', 'ÇORUM', 'DENİZLİ', 'DİYARBAKIR', 'DÜZCE', 'EDİRNE', 'ELAZIĞ', 'ERZİNCAN',
  'ERZURUM', 'ESKİŞEHİR', 'GAZİANTEP', 'GİRESUN', 'GÜMÜŞHANE', 'HAKKARİ', 'HATAY', 'IĞDIR', 'ISPARTA', 'İSTANBUL',
  'İZMİR', 'KAHRAMANMARAŞ', 'KARABÜK', 'KARAMAN', 'KARS', 'KASTAMONU', 'KAYSERİ', 'KIRIKKALE', 'KIRKLARELİ', 'KIRŞEHİR',
  'KİLİS', 'KOCAELİ', 'KONYA', 'KÜTAHYA', 'MALATYA', 'MANİSA', 'MARDİN', 'MERSİN', 'MUĞLA', 'MUŞ',
  'NEVŞEHİR', 'NİĞDE', 'ORDU', 'OSMANİYE', 'RİZE', 'SAKARYA', 'SAMSUN', 'SİİRT', 'SİNOP', 'SİVAS',
  'ŞANLIURFA', 'ŞIRNAK', 'TEKİRDAĞ', 'TOKAT', 'TRABZON', 'TUNCELİ', 'UŞAK', 'VAN', 'YALOVA', 'YOZGAT', 'ZONGULDAK'
];

export default function DataTable({ defaultDegree = 'Lisans (4+ Yıl)', title = 'Lisans Programları' }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [exactMatch, setExactMatch] = useState(false);

  // Dynamic Full Department Names List fetched from API
  const [allDepartmentNames, setAllDepartmentNames] = useState([]);

  // Multi-select State Arrays
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedUniTypes, setSelectedUniTypes] = useState([]);
  const [selectedScoreTypes, setSelectedScoreTypes] = useState([]);
  const [selectedDegrees, setSelectedDegrees] = useState(defaultDegree ? [defaultDegree] : []);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedSpecialQuotas, setSelectedSpecialQuotas] = useState([]);

  // Ranking Range Filter State (e.g. 50.000 - 100.000)
  const [minRank, setMinRank] = useState('');
  const [maxRank, setMaxRank] = useState('');

  // Database-wide Aggregated Totals Summary State
  const [dbSummary, setDbSummary] = useState({
    total_quota_2025: 0,
    total_quota_2026: 0,
    net_diff: 0,
    matching_records: 0
  });

  // Fetch ALL unique department names for active degree dynamically from Database
  useEffect(() => {
    setSelectedPrograms([]); // Reset selection when switching tabs
    axios.get('/api/department-names/', { params: { degree: defaultDegree } })
      .then(res => {
        if (Array.isArray(res.data)) {
          setAllDepartmentNames(res.data);
        }
      })
      .catch(err => console.error('Error fetching department names:', err));
  }, [defaultDegree]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        exact: exactMatch,
        program_names: selectedPrograms.join(','),
        cities: selectedCities.join(','),
        uni_types: selectedUniTypes.join(','),
        score_types: selectedScoreTypes.join(','),
        degrees: selectedDegrees.length > 0 ? selectedDegrees.join(',') : (defaultDegree || ''),
        special_quotas: selectedSpecialQuotas.join(','),
        min_rank: minRank,
        max_rank: maxRank,
        limit: 500
      };
      const res = await axios.get('/api/programs/', { params });
      setPrograms(res.data.results || []);
      if (res.data.summary) {
        setDbSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrograms();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, exactMatch, selectedPrograms, selectedCities, selectedUniTypes, selectedScoreTypes, selectedDegrees, selectedStatuses, selectedSpecialQuotas, minRank, maxRank, defaultDegree]);

  const handleQuickSearch = (keyword) => {
    setSearch(keyword);
  };

  const handleRankPreset = (minVal, maxVal) => {
    setMinRank(minVal ? String(minVal) : '');
    setMaxRank(maxVal ? String(maxVal) : '');
  };

  const clearRankFilter = () => {
    setMinRank('');
    setMaxRank('');
  };

  // Helper to extract PURE QUOTA value based on active Kontenjan Türü filter
  const getQuotaValue = (record) => {
    if (!record) return 0;
    if (selectedSpecialQuotas.includes('Okul Birincisi Kontenjanı')) {
      return record.top_school_quota || 0;
    }
    if (selectedSpecialQuotas.includes('Meslek Lisesi / MOKO Kontenjanı')) {
      return record.meb_quota || 0;
    }
    if (selectedSpecialQuotas.includes('Toplam Kontenjan (Genel + Özel)')) {
      return record.total_quota || 0;
    }
    // Default PURE Genel Kontenjan (excluding top school & MEB)
    return record.general_quota !== undefined && record.general_quota !== null
      ? record.general_quota
      : record.total_quota || 0;
  };

  // Dynamic Label for Quota Column Header
  const getQuotaHeaderLabel = () => {
    if (selectedSpecialQuotas.includes('Okul Birincisi Kontenjanı')) return 'Okul Birincisi Kontenjanı';
    if (selectedSpecialQuotas.includes('Meslek Lisesi / MOKO Kontenjanı')) return 'Meslek Lisesi Kontenjanı';
    if (selectedSpecialQuotas.includes('Toplam Kontenjan (Genel + Özel)')) return 'Toplam Kontenjan';
    return 'Genel Kontenjan';
  };

  // Client-side filter for status
  const filteredPrograms = programs.filter(p => {
    if (selectedStatuses.length === 0) return true;

    const r2025 = p.quota_records.find(r => r.year === 2025);
    const r2026 = p.quota_records.find(r => r.year === 2026);
    
    const k25 = getQuotaValue(r2025);
    const k26 = getQuotaValue(r2026);

    const isClosed = k25 > 0 && k26 === 0;
    const isNew = k25 === 0 && k26 > 0;
    const isActive = !isClosed;

    let match = false;
    if (selectedStatuses.includes('Kapatılanlar Hariç') && isActive) match = true;
    if ((selectedStatuses.includes('Kapatılanlar (-100%)') || selectedStatuses.includes('Sadece Kapatılanlar (-100%)')) && isClosed) match = true;
    if ((selectedStatuses.includes('Yeni Açılanlar (+100%)') || selectedStatuses.includes('Sadece Yeni Açılanlar (+100%)')) && isNew) match = true;

    return match;
  });

  // Calculate dynamic ribbon sums for active quota type
  const activeQuotaHeader = getQuotaHeaderLabel();
  const sum2026Active = filteredPrograms.reduce((acc, p) => acc + getQuotaValue(p.quota_records.find(r => r.year === 2026)), 0);
  const sum2025Active = filteredPrograms.reduce((acc, p) => acc + getQuotaValue(p.quota_records.find(r => r.year === 2025)), 0);
  const netDiffActive = sum2026Active - sum2025Active;

  const exportExcel = () => {
    const excelData = filteredPrograms.map(p => {
      const r25 = p.quota_records.find(r => r.year === 2025);
      const r26 = p.quota_records.find(r => r.year === 2026);
      const k25 = getQuotaValue(r25);
      const k26 = getQuotaValue(r26);
      const rank25 = r25 && r25.min_ranking ? r25.min_ranking : 'Dolmadı / Yok';
      const diff = k26 - k25;
      
      let statusStr = '%0';
      if (k25 > 0 && k26 === 0) statusStr = '-100% (Kapatıldı)';
      else if (k25 === 0 && k26 > 0) statusStr = '+100% (Yeni Açıldı)';
      else if (k25 > 0) statusStr = `${((diff / k25) * 100).toFixed(1)}%`;

      return {
        'Üniversite Adı': p.university_name,
        'Üniversite Türü': p.university_type,
        'Şehir': p.city,
        'Program / Bölüm Adı': p.name,
        'Puan Türü': p.score_type,
        '2025 Son Yerleşen Sıralaması': rank25,
        [`2025 ${activeQuotaHeader}`]: k25,
        [`2026 ${activeQuotaHeader}`]: k26,
        'Net Değişim': diff,
        'Değişim Status': statusStr
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kontenjan Analizi');
    XLSX.writeFile(workbook, `YOK_${title.replace(/\s+/g, '_')}_Raporu.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Search & Multi-Select Filter Header Panel */}
      <div className="premium-card p-6 rounded-3xl space-y-5 bg-white border border-slate-200 shadow-sm">
        {/* Title & Search Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-blue-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${title} arasında arayın (Örn: Yazılım, Tıp, Mimarlık, Hukuk, Bilgisayar Programcılığı...)`}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Exact Match Checkbox Button */}
          <label className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border cursor-pointer select-none transition-all text-xs font-bold ${
            exactMatch
              ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={exactMatch}
              onChange={(e) => setExactMatch(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>📌 Birebir Tam Eşleşme</span>
          </label>

          {/* Excel Export Button */}
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md shadow-amber-500/20 transition-all shrink-0"
          >
            <Download className="w-4 h-4" /> Excel Olarak İndir
          </button>
        </div>

        {/* Quick Search Suggestion Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Hızlı Aramalar:</span>
          {(defaultDegree.includes('Önlisans')
            ? ['Bilgisayar Programcılığı', 'İlk ve Acil Yardım', 'Adalet', 'Ağız ve Diş Sağlığı', 'Anestezi', 'Diyaliz', 'Uçak Teknolojisi']
            : ['Yazılım Mühendisliği', 'Tıp', 'Hukuk', 'Mimarlık', 'Bilgisayar Mühendisliği', 'Psikoloji', 'Hemşirelik']
          ).map((tag) => (
            <button
              key={tag}
              onClick={() => handleQuickSearch(tag)}
              className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 px-3 py-1 rounded-full text-[11px] font-medium border border-slate-200 transition-all"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Ranking Range Filter Bar */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>🎯 2025 Yerleşen Son Kişi Sıralama Aralığı Filtresi</span>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="text-slate-400 font-semibold">Hızlı Aralıklar:</span>
              <button
                onClick={() => handleRankPreset(1, 10000)}
                className="bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 px-2.5 py-1 rounded-lg font-bold"
              >
                Top 10.000
              </button>
              <button
                onClick={() => handleRankPreset(10000, 50000)}
                className="bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 px-2.5 py-1 rounded-lg font-bold"
              >
                10k – 50k
              </button>
              <button
                onClick={() => handleRankPreset(50000, 100000)}
                className="bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 px-2.5 py-1 rounded-lg font-bold"
              >
                50k – 100k
              </button>
              <button
                onClick={() => handleRankPreset(100000, 300000)}
                className="bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 px-2.5 py-1 rounded-lg font-bold"
              >
                100k – 300k
              </button>
              {(minRank || maxRank) && (
                <button
                  onClick={clearRankFilter}
                  className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Temizle
                </button>
              )}
            </div>
          </div>

          {/* Ranking Min - Max Number Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                En Yüksek Sıralama (Min):
              </label>
              <input
                type="number"
                value={minRank}
                onChange={(e) => setMinRank(e.target.value)}
                placeholder="Örn: 50000"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                En Düşük Sıralama (Max):
              </label>
              <input
                type="number"
                value={maxRank}
                onChange={(e) => setMaxRank(e.target.value)}
                placeholder="Örn: 100000"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Custom Multi-Select Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 z-20">
          {/* SEARCHABLE MULTI-SELECT PROGRAM COMBOBOX */}
          <MultiSelectDropdown
            label="🎓 Program / Bölüm"
            options={allDepartmentNames}
            selectedValues={selectedPrograms}
            onChange={setSelectedPrograms}
            placeholder="Bölüm adı arayın..."
            allLabel="Tüm Bölümler"
          />

          {/* GENERAL & SPECIAL QUOTAS FILTER */}
          <MultiSelectDropdown
            label="⭐ Kontenjan Türü"
            options={[
              'Genel Kontenjan',
              'Okul Birincisi Kontenjanı',
              'Meslek Lisesi / MOKO Kontenjanı',
              'Toplam Kontenjan (Genel + Özel)'
            ]}
            selectedValues={selectedSpecialQuotas}
            onChange={setSelectedSpecialQuotas}
            placeholder="Kontenjan süzün..."
            allLabel="Tüm Kontenjanlar"
          />

          {/* Multi-Select Status Filter */}
          <MultiSelectDropdown
            label="📈 Durum Filtresi"
            options={['Kapatılanlar Hariç', 'Kapatılanlar (-100%)', 'Yeni Açılanlar (+100%)']}
            selectedValues={selectedStatuses}
            onChange={setSelectedStatuses}
            placeholder="Durum süzün..."
            allLabel="Tüm Durumlar"
          />

          {/* Multi-Select University Type Filter */}
          <MultiSelectDropdown
            label="🏫 Üniversite Türü"
            options={['Devlet', 'Vakıf', 'KKTC']}
            selectedValues={selectedUniTypes}
            onChange={setSelectedUniTypes}
            placeholder="Tür arayın..."
            allLabel="Tüm Türler"
          />

          {/* Multi-Select Score Type Filter */}
          <MultiSelectDropdown
            label="🎯 Puan Türü"
            options={['SAY', 'EA', 'SÖZ', 'DİL', 'TYT']}
            selectedValues={selectedScoreTypes}
            onChange={setSelectedScoreTypes}
            placeholder="Puan arayın..."
            allLabel="Tüm Puanlar"
          />

          {/* Multi-Select Searchable Cities Filter */}
          <MultiSelectDropdown
            label="🏙️ Şehir"
            options={CITIES_LIST}
            selectedValues={selectedCities}
            onChange={setSelectedCities}
            placeholder="İl adı yazın..."
            allLabel="Tüm İller"
          />
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-emerald-600/10">
        <div className="flex items-center gap-2.5 font-extrabold text-sm">
          <Sparkles className="w-5 h-5 text-emerald-200" />
          <span>🎯 GÜNCEL (2026) {activeQuotaHeader.toUpperCase()}: {sum2026Active.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold">
          <span>2025 {activeQuotaHeader}: <strong>{sum2025Active.toLocaleString()}</strong></span>
          <span>Net Değişim: <strong>{netDiffActive >= 0 ? `+${netDiffActive.toLocaleString()}` : netDiffActive.toLocaleString()}</strong></span>
          <span>Toplam Bölüm Sayısı: <strong>{dbSummary.matching_records.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="premium-card rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto max-h-[620px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/90 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10 backdrop-blur-md">
              <tr>
                <th className="py-3.5 px-5">Üniversite Adı</th>
                <th className="py-3.5 px-3 text-center">Tür</th>
                <th className="py-3.5 px-3 text-center">Şehir</th>
                <th className="py-3.5 px-5">Program / Bölüm Adı</th>
                <th className="py-3.5 px-3 text-center">Puan</th>
                <th className="py-3.5 px-4 text-right bg-blue-50/70 text-blue-900 border-x border-blue-100">
                  2025 Yerleşen Son Sıralama
                </th>
                <th className="py-3.5 px-3 text-right">2025 {activeQuotaHeader}</th>
                <th className="py-3.5 px-3 text-right">2026 {activeQuotaHeader}</th>
                <th className="py-3.5 px-3 text-right">Net Değişim</th>
                <th className="py-3.5 px-3 text-center">Değişim Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-slate-400 font-semibold">
                    ⏳ Veriler yükleniyor...
                  </td>
                </tr>
              ) : filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-slate-400 font-semibold">
                    Arama, sıralama aralığı ve süzgeç kriterlerinize uygun program bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((p) => {
                  const r25 = p.quota_records.find(r => r.year === 2025);
                  const r26 = p.quota_records.find(r => r.year === 2026);
                  const k25 = getQuotaValue(r25);
                  const k26 = getQuotaValue(r26);
                  const rank25 = r25 && r25.min_ranking ? r25.min_ranking.toLocaleString() : 'Dolmadı / Yok';
                  const diff = k26 - k25;

                  const isClosed = k25 > 0 && k26 === 0;
                  const isNew = k25 === 0 && k26 > 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isClosed ? 'bg-rose-50/70' : isNew ? 'bg-emerald-50/70' : ''
                      }`}
                    >
                      <td className="py-3 px-5 font-bold text-slate-900">{p.university_name}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-slate-200">
                          {p.university_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600 font-medium">{p.city}</td>
                      <td className="py-3 px-5 text-blue-700 font-bold">{p.name}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-slate-700">{p.score_type}</td>
                      
                      {/* 2025 Last Placed Student Ranking Column */}
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-900 bg-blue-50/40 border-x border-blue-100">
                        {rank25}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700">{k25.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900">{k26.toLocaleString()}</td>
                      <td className={`py-3 px-3 text-right font-mono font-extrabold ${
                        diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isClosed ? (
                          <span className="bg-rose-100 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-full font-bold text-[10px]">
                            🚫 KAPATILDI (-100%)
                          </span>
                        ) : isNew ? (
                          <span className="bg-emerald-100 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-bold text-[10px]">
                            🟢 YENİ AÇILDI (+100%)
                          </span>
                        ) : diff > 0 ? (
                          <span className="text-emerald-600 font-extrabold">▲ +{k25 > 0 ? ((diff/k25)*100).toFixed(1) : 0}%</span>
                        ) : diff < 0 ? (
                          <span className="text-rose-600 font-extrabold">▼ {k25 > 0 ? ((diff/k25)*100).toFixed(1) : 0}%</span>
                        ) : (
                          <span className="text-slate-400">%0</span>
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
