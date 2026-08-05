import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Sum
from analytics.models import University, Program, QuotaRecord
from analytics.serializers import ProgramSerializer, UniversitySerializer
from analytics.services.ml_engine import predict_program_ranking_2026, predict_program_future, get_dashboard_analytics
from analytics.services.ingestion import ingest_excel_file

class DepartmentNamesView(APIView):
    """
    Veritabanındaki tüm benzersiz Lisans veya Önlisans bölüm isimlerini alfabe sırasıyla döner.
    """
    def get(self, request):
        degree = request.GET.get('degree', '').strip()
        qs = Program.objects.all()
        if degree:
            qs = qs.filter(degree__icontains=degree.split(' ')[0])
        
        raw_names = qs.values_list('clean_name', flat=True).distinct()
        unique_names = sorted(list(set([n.strip() for n in raw_names if n and n.strip()])))
        return Response(unique_names)


class ProgramListView(APIView):
    """
    Kapsamlı arama, çoklu bölüm seçimi, özel kontenjanlar, sıralama aralığı ve 
    tüm veritabanı toplam metriklerini dönen Program Listesi Uç Noktası.
    """
    def get(self, request):
        queryset = Program.objects.select_related('university').prefetch_related('quota_records').all()

        search = request.GET.get('search', '').strip()
        exact_match = request.GET.get('exact', 'false').lower() == 'true'

        if search:
            if exact_match:
                queryset = queryset.filter(
                    Q(clean_name__iexact=search) | Q(name__iexact=search)
                )
            else:
                queryset = queryset.filter(
                    Q(name__icontains=search) | Q(clean_name__icontains=search)
                )

        # Multi-select Program Names Filter
        program_names = request.GET.get('program_names', '')
        if program_names and program_names != 'Tümü':
            prog_list = [p.strip() for p in program_names.split(',') if p.strip() and p.strip() != 'Tümü']
            if prog_list:
                prog_q = Q()
                for p_item in prog_list:
                    prog_q |= Q(clean_name__iexact=p_item) | Q(clean_name__icontains=p_item)
                queryset = queryset.filter(prog_q)

        cities = request.GET.get('cities', '')
        if cities and cities != 'Tümü':
            city_list = [c.strip() for c in cities.split(',') if c.strip() and c.strip() != 'Tümü']
            if city_list:
                queryset = queryset.filter(university__city__in=city_list)

        uni_types = request.GET.get('uni_types', '')
        if uni_types and uni_types != 'Tümü':
            type_list = [t.strip() for t in uni_types.split(',') if t.strip() and t.strip() != 'Tümü']
            if type_list:
                queryset = queryset.filter(university__uni_type__in=type_list)

        score_types = request.GET.get('score_types', '')
        if score_types and score_types != 'Tümü':
            puan_list = [p.strip().upper() for p in score_types.split(',') if p.strip() and p.strip() != 'Tümü']
            if puan_list:
                queryset = queryset.filter(score_type__in=puan_list)

        degrees = request.GET.get('degrees', '')
        if degrees and degrees != 'Tümü':
            deg_list = [d.strip() for d in degrees.split(',') if d.strip() and d.strip() != 'Tümü']
            if deg_list:
                queryset = queryset.filter(degree__in=deg_list)

        # Special Quotas Filter (Okul Birincisi vb.)
        special_quotas = request.GET.get('special_quotas', '')
        if special_quotas and special_quotas != 'Tümü':
            sq_list = [s.strip() for s in special_quotas.split(',') if s.strip() and s.strip() != 'Tümü']
            if sq_list:
                sq_q = Q()
                if any('Okul Birincisi' in s for s in sq_list):
                    sq_q |= Q(quota_records__top_school_quota__gt=0)
                queryset = queryset.filter(sq_q)

        # Ranking Range Filter (e.g. 50.000 - 100.000)
        min_rank = request.GET.get('min_rank', '').strip()
        max_rank = request.GET.get('max_rank', '').strip()

        if min_rank or max_rank:
            rank_q = Q(quota_records__year=2025, quota_records__min_ranking__gt=0)
            if min_rank and min_rank.isdigit():
                rank_q &= Q(quota_records__min_ranking__gte=int(min_rank))
            if max_rank and max_rank.isdigit():
                rank_q &= Q(quota_records__min_ranking__lte=int(max_rank))
            queryset = queryset.filter(rank_q)

        queryset = queryset.distinct()
        total_matching_count = queryset.count()

        # Database-wide aggregated totals for current filters
        filtered_program_ids = queryset.values_list('id', flat=True)
        sum_2025 = QuotaRecord.objects.filter(program_id__in=filtered_program_ids, year=2025).aggregate(tot=Sum('total_quota'))['tot'] or 0
        sum_2026 = QuotaRecord.objects.filter(program_id__in=filtered_program_ids, year=2026).aggregate(tot=Sum('total_quota'))['tot'] or 0
        net_diff = sum_2026 - sum_2025

        limit = int(request.GET.get('limit', 500))
        results = queryset[:limit]

        serializer = ProgramSerializer(results, many=True)

        return Response({
            "count": total_matching_count,
            "summary": {
                "total_quota_2025": sum_2025,
                "total_quota_2026": sum_2026,
                "net_diff": net_diff,
                "matching_records": total_matching_count
            },
            "results": serializer.data
        })


class RankingForecastListView(APIView):
    """
    2026 YKS Sıralama Tahminleri Listesi Uç Noktası.
    """
    def get(self, request):
        queryset = Program.objects.select_related('university').prefetch_related('quota_records').all()

        search = request.GET.get('search', '').strip()
        exact_match = request.GET.get('exact', 'false').lower() == 'true'

        if search:
            if exact_match:
                queryset = queryset.filter(
                    Q(clean_name__iexact=search) | Q(name__iexact=search)
                )
            else:
                queryset = queryset.filter(
                    Q(name__icontains=search) | Q(clean_name__icontains=search)
                )

        score_types = request.GET.get('score_types', '')
        if score_types and score_types != 'Tümü':
            puan_list = [p.strip().upper() for p in score_types.split(',') if p.strip() and p.strip() != 'Tümü']
            if puan_list:
                queryset = queryset.filter(score_type__in=puan_list)

        limit = int(request.GET.get('limit', 300))
        programs = queryset[:limit]

        results = []
        for p in programs:
            pred = predict_program_ranking_2026(p.id)
            if pred:
                results.append(pred)

        return Response({
            "count": len(results),
            "results": results
        })


class DashboardAnalyticsView(APIView):
    """
    Dashboard Metrikleri Uç Noktası.
    """
    def get(self, request):
        data = get_dashboard_analytics()
        return Response(data)


class ProgramPredictView(APIView):
    """
    Program Detayı Uç Noktası.
    """
    def get(self, request, program_id):
        try:
            program = Program.objects.select_related('university').prefetch_related('quota_records').get(pk=program_id)
        except Program.DoesNotExist:
            return Response({"error": "Program bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProgramSerializer(program)
        prediction = predict_program_future(program.id)

        return Response({
            "program": serializer.data,
            "prediction": prediction
        })


class IngestExcelView(APIView):
    """
    Manuel Excel Yükleme Uç Noktası.
    """
    def post(self, request):
        file_obj = request.FILES.get('file')
        year = int(request.data.get('year', 2026))

        if not file_obj:
            return Response({"error": "Dosya yüklenmedi."}, status=status.HTTP_400_BAD_REQUEST)

        temp_path = f"temp_{file_obj.name}"
        with open(temp_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        try:
            created_count, updated_count = ingest_excel_file(temp_path, year)
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return Response({
                "message": "İçe aktarma tamamlandı.",
                "created_count": created_count,
                "updated_count": updated_count
            })
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
