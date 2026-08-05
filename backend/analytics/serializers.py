from rest_framework import serializers
from analytics.models import University, Program, QuotaRecord

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['id', 'name', 'city', 'uni_type']


class QuotaRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotaRecord
        fields = ['id', 'year', 'general_quota', 'top_school_quota', 'meb_quota', 'total_quota', 'min_score', 'min_ranking', 'is_closed', 'is_new']


class ProgramSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    university_type = serializers.CharField(source='university.uni_type', read_only=True)
    city = serializers.CharField(source='university.city', read_only=True)
    quota_records = QuotaRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'code', 'name', 'clean_name', 
            'university_name', 'university_type', 'city',
            'degree', 'score_type', 'duration', 'quota_records'
        ]
