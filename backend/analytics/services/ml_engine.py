import numpy as np
from django.db import models
from analytics.models import Program, QuotaRecord, University

EMPIRICAL_BETA = 0.2554      # ML Kontenjan esneklik katsayısı
EMPIRICAL_INTERCEPT = 0.0063  # ML Yıllık genel taban kayma sabiti

def predict_program_ranking_2026(program_id):
    """
    Tüm yıllardaki (2021-2025) kontenjan ve sıralama verilerini ML Regresyonu ile analiz ederek
    2026 Tahmini Sıralama Aralığını (Min - Central - Max) hesaplar.
    """
    try:
        program = Program.objects.get(id=program_id)
    except Program.DoesNotExist:
        return None

    recs = {r.year: r for r in program.quota_records.all()}
    r2025 = recs.get(2025)
    r2026 = recs.get(2026)

    rank_2025 = r2025.min_ranking if r2025 and r2025.min_ranking else None
    quota_2025 = r2025.total_quota if r2025 else 0
    quota_2026 = r2026.total_quota if r2026 else 0

    is_closed = quota_2025 > 0 and quota_2026 == 0
    is_new = quota_2025 == 0 and quota_2026 > 0

    if is_closed:
        return {
            "program_id": program.id,
            "program_code": program.code,
            "program_name": program.name,
            "university_name": program.university.name,
            "city": program.university.city,
            "score_type": program.score_type,
            "rank_2025": rank_2025,
            "quota_2025": quota_2025,
            "quota_2026": 0,
            "quota_diff": -quota_2025,
            "predicted_rank_2026": None,
            "rank_min_2026": None,
            "rank_max_2026": None,
            "rank_range_str": "-",
            "rank_shift": None,
            "status": "closed",
            "status_label": "🚫 KAPATILDI",
            "explanation": "Bu program 2026 YKS'de kapatılmıştır."
        }

    if is_new:
        return {
            "program_id": program.id,
            "program_code": program.code,
            "program_name": program.name,
            "university_name": program.university.name,
            "city": program.university.city,
            "score_type": program.score_type,
            "rank_2025": None,
            "quota_2025": 0,
            "quota_2026": quota_2026,
            "quota_diff": quota_2026,
            "predicted_rank_2026": None,
            "rank_min_2026": None,
            "rank_max_2026": None,
            "rank_range_str": "-",
            "rank_shift": None,
            "status": "new",
            "status_label": "🟢 YENİ AÇILDI",
            "explanation": "2026 yılında yeni açılan program."
        }

    if not rank_2025 or rank_2025 == 0:
        return {
            "program_id": program.id,
            "program_code": program.code,
            "program_name": program.name,
            "university_name": program.university.name,
            "city": program.university.city,
            "score_type": program.score_type,
            "rank_2025": None,
            "quota_2025": quota_2025,
            "quota_2026": quota_2026,
            "quota_diff": quota_2026 - quota_2025,
            "predicted_rank_2026": None,
            "rank_min_2026": None,
            "rank_max_2026": None,
            "rank_range_str": "-",
            "rank_shift": None,
            "status": "no_rank",
            "status_label": "⚪ SIRALAMA DOLMADI",
            "explanation": "2025 yılı son kişi yerleşme sıralama verisi bulunamadı."
        }

    # 1. Kontenjan Değişim Oranı
    quota_diff = quota_2026 - quota_2025
    if quota_2025 > 0:
        dq_pct = quota_diff / float(quota_2025)
    else:
        dq_pct = 0.0

    # 2. Bölümün Çok Yıllı Organik Sıralama Trendi
    history_ranks = [recs[y].min_ranking for y in sorted(recs.keys()) if recs[y].min_ranking and recs[y].min_ranking > 0]
    history_years = [y for y in sorted(recs.keys()) if recs[y].min_ranking and recs[y].min_ranking > 0]

    organic_trend_slope = 0.0
    if len(history_ranks) >= 3:
        y_log = np.log(history_ranks)
        x_years = np.array(history_years) - 2021
        slope_t, _ = np.polyfit(x_years, y_log, 1)
        organic_trend_slope = float(slope_t)

    # 3. ML Nokta Tahmini
    predicted_dr = (EMPIRICAL_BETA * dq_pct + EMPIRICAL_INTERCEPT) + (0.35 * organic_trend_slope)
    predicted_rank_2026 = int(round(rank_2025 * (1.0 + predicted_dr)))
    predicted_rank_2026 = max(1, predicted_rank_2026)

    # 4. Tahmin Aralığı (Confidence Interval Range: +-5%)
    margin = 0.05
    rank_min_2026 = max(1, int(round(predicted_rank_2026 * (1.0 - margin))))
    rank_max_2026 = int(round(predicted_rank_2026 * (1.0 + margin)))
    rank_range_str = f"{rank_min_2026:,} – {rank_max_2026:,}"

    rank_shift = predicted_rank_2026 - rank_2025

    if quota_diff > 0:
        status_label = "🟢 SIRALAMA ESNEYECEK (Girme Şansı Artacak)"
        status = "easier"
    elif quota_diff < 0:
        status_label = "🔴 SIRALAMA YÜKSELECEK (Girme Zorlaşacak)"
        status = "harder"
    else:
        status_label = "⚪ SIRALAMA STABİL"
        status = "stable"

    explanation = (
        f"2025 yerleşen son kişi sıralaması {rank_2025:,} ve kontenjan değişimi {quota_2025} -> {quota_2026} ({'+' if quota_diff>0 else ''}{quota_diff}). "
        f"ML Modeli 2026 tahmini yerleşme sıralamasını {rank_range_str} aralığında öngörmektedir."
    )

    return {
        "program_id": program.id,
        "program_code": program.code,
        "program_name": program.name,
        "university_name": program.university.name,
        "city": program.university.city,
        "score_type": program.score_type,
        "rank_2025": rank_2025,
        "quota_2025": quota_2025,
        "quota_2026": quota_2026,
        "quota_diff": quota_diff,
        "predicted_rank_2026": predicted_rank_2026,
        "rank_min_2026": rank_min_2026,
        "rank_max_2026": rank_max_2026,
        "rank_range_str": rank_range_str,
        "rank_shift": rank_shift,
        "status": status,
        "status_label": status_label,
        "explanation": explanation
    }

def predict_program_future(program_id):
    return predict_program_ranking_2026(program_id)

def get_dashboard_analytics():
    total_unis = University.objects.count()
    total_programs = Program.objects.count()
    total_records = QuotaRecord.objects.count()

    years = list(QuotaRecord.objects.values_list('year', flat=True).distinct().order_by('year'))
    yearly_stats = []
    for y in years:
        tot_q = QuotaRecord.objects.filter(year=y).aggregate(tot=models.Sum('total_quota'))['tot'] or 0
        closed_cnt = QuotaRecord.objects.filter(year=y, is_closed=True).count()
        yearly_stats.append({
            "year": y,
            "total_quota": tot_q,
            "closed_count": closed_cnt
        })

    uni_types = University.objects.values('uni_type').annotate(count=models.Count('id'))

    return {
        "summary": {
            "total_universities": total_unis,
            "total_programs": total_programs,
            "total_records": total_records
        },
        "yearly_trends": yearly_stats,
        "university_types": list(uni_types)
    }
