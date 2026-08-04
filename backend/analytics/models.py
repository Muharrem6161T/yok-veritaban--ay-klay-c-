from django.db import models

class University(models.Model):
    UNI_TYPE_CHOICES = [
        ('Devlet', 'Devlet'),
        ('Vakıf', 'Vakıf'),
        ('KKTC', 'KKTC'),
        ('Yabancı', 'Yabancı'),
        ('Bilinmiyor', 'Bilinmiyor'),
    ]

    name = models.CharField(max_length=255, unique=True, verbose_name="Üniversite Adı")
    city = models.CharField(max_length=100, default="Diğer", verbose_name="Şehir")
    uni_type = models.CharField(max_length=50, choices=UNI_TYPE_CHOICES, default="Devlet", verbose_name="Üniversite Türü")

    class Meta:
        verbose_name = "Üniversite"
        verbose_name_plural = "Üniversiteler"
        ordering = ['name']

    def __str__(self):
        return self.name


class Program(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name="Program Kodu")
    name = models.CharField(max_length=255, verbose_name="Program / Bölüm Adı")
    clean_name = models.CharField(max_length=255, verbose_name="Temiz Bölüm Adı")
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name="programs", verbose_name="Üniversite")
    degree = models.CharField(max_length=50, default="Lisans (4+ Yıl)", verbose_name="Öğrenim Derecesi")
    score_type = models.CharField(max_length=20, default="SAY", verbose_name="Puan Türü")
    duration = models.IntegerField(default=4, verbose_name="Süre (Yıl)")

    class Meta:
        verbose_name = "Program"
        verbose_name_plural = "Programlar"
        ordering = ['university__name', 'name']

    def __str__(self):
        return f"{self.university.name} - {self.name} ({self.code})"


class QuotaRecord(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="quota_records", verbose_name="Program")
    year = models.IntegerField(verbose_name="Yıl")
    general_quota = models.IntegerField(default=0, verbose_name="Genel Kontenjan")
    top_school_quota = models.IntegerField(default=0, verbose_name="Okul Birincisi Kontenjanı")
    total_quota = models.IntegerField(default=0, verbose_name="Toplam Kontenjan")
    min_score = models.FloatField(null=True, blank=True, verbose_name="En Düşük Puan")
    min_ranking = models.IntegerField(null=True, blank=True, verbose_name="En Düşük Sıralama")
    is_closed = models.BooleanField(default=False, verbose_name="Kapatıldı mı?")
    is_new = models.BooleanField(default=False, verbose_name="Yeni Açıldı mı?")

    class Meta:
        verbose_name = "Kontenjan Kaydı"
        verbose_name_plural = "Kontenjan Kayıtları"
        unique_together = ('program', 'year')
        ordering = ['year', 'program']

    def __str__(self):
        return f"{self.program.name} [{self.year}]: {self.total_quota} Kontenjan"
