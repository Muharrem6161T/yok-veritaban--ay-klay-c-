import os
import re
import pandas as pd
import numpy as np
from analytics.models import University, Program, QuotaRecord

CITIES_SET = {
    'ADANA', 'ADIYAMAN', 'AFYONKARAHİSAR', 'AĞRI', 'AKSARAY', 'AMASYA', 'ANKARA', 'ANTALYA', 'ARDAHAN', 'ARTVİN',
    'AYDIN', 'BALIKESİR', 'BARTIN', 'BATMAN', 'BAYBURT', 'BİLECİK', 'BİNGÖL', 'BİTLİS', 'BOLU', 'BURDUR', 'BURSA',
    'ÇANAKKALE', 'ÇANKIRI', 'ÇORUM', 'DENİZLİ', 'DİYARBAKIR', 'DÜZCE', 'EDİRNE', 'ELAZIĞ', 'ERZİNCAN', 'ERZURUM',
    'ESKİŞEHİR', 'GAZİANTEP', 'GİRESUN', 'GÜMÜŞHANE', 'HAKKARİ', 'HATAY', 'IĞDIR', 'ISPARTA', 'İSTANBUL', 'İZMİR',
    'KAHRAMANMARAŞ', 'KARABÜK', 'KARAMAN', 'KARS', 'KASTAMONU', 'KAYSERİ', 'KIRIKKALE', 'KIRKLARELİ', 'KIRŞEHİR',
    'KİLİS', 'KOCAELİ', 'KONYA', 'KÜTAHYA', 'MALATYA', 'MANİSA', 'MARDİN', 'MERSİN', 'MUĞLA', 'MUŞ', 'NEVŞEHİR',
    'NİĞDE', 'ORDU', 'OSMANİYE', 'RİZE', 'SAKARYA', 'SAMSUN', 'SİİRT', 'SİNOP', 'SİVAS', 'ŞANLIURFA', 'ŞIRNAK',
    'TEKİRDAĞ', 'TOKAT', 'TRABZON', 'TUNCELİ', 'UŞAK', 'VAN', 'YALOVA', 'YOZGAT', 'ZONGULDAK', 'KKTC', 'YABANCI'
}

def detect_city(uni_name):
    if not uni_name:
        return "Diğer"
    name_upper = str(uni_name).upper()
    for city in CITIES_SET:
        if city in name_upper:
            return city
    return "Diğer"

def detect_uni_type(uni_name):
    if not uni_name:
        return "Bilinmiyor"
    name_str = str(uni_name)
    if "Devlet" in name_str:
        return "Devlet"
    elif "Vakıf" in name_str or "Özel" in name_str:
        return "Vakıf"
    elif "KKTC" in name_str:
        return "KKTC"
    elif "Yabancı" in name_str:
        return "Yabancı"
    return "Devlet"

def clean_dept_name(name):
    cleaned = re.sub(r'\(.*?\)', '', str(name)).strip()
    return cleaned if cleaned else str(name)

def ingest_excel_file(file_path, year, default_degree=None):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Excel dosyası bulunamadı: {file_path}")

    df = pd.read_excel(file_path, header=None)

    is_program_code = pd.to_numeric(df[0], errors='coerce').notna()
    is_uni_header = (~is_program_code) & df[1].astype(str).str.contains('ÜNİVERSİTESİ', case=False, na=False)

    df['UNIVERSTE_ADI'] = np.where(is_uni_header, df[1], np.nan)
    df['UNIVERSTE_ADI'] = df['UNIVERSTE_ADI'].ffill()

    df_bolumler = df[is_program_code].copy()
    if df_bolumler.empty:
        return 0, 0

    sample_row = df_bolumler.iloc[0]
    rank_col = None
    score_col = None

    for c in range(4, len(sample_row)):
        val = pd.to_numeric(sample_row.iloc[c], errors='coerce')
        if pd.notna(val):
            if 100 <= val <= 3500000 and val == int(val) and c > 5:
                if rank_col is None:
                    rank_col = c
            elif 100.0 <= val <= 600.0 and (val != int(val)):
                if score_col is None:
                    score_col = c

    records_created = 0
    records_updated = 0
    prev_year = year - 1

    for idx, row in df_bolumler.iterrows():
        prog_code = str(row.iloc[0]).split('.')[0].strip()
        prog_name = str(row.iloc[1]).strip()
        uni_name = str(row['UNIVERSTE_ADI']).strip() if pd.notna(row['UNIVERSTE_ADI']) else "Bilinmeyen Üniversite"
        
        duration = pd.to_numeric(row.iloc[2], errors='coerce')
        duration = int(duration) if pd.notna(duration) else (2 if default_degree == "Önlisans (2 Yıl)" else 4)
        
        puan_turu = str(row.iloc[3]).strip().upper() if pd.notna(row.iloc[3]) else ("TYT" if duration <= 2 else "SAY")

        # Kontenjanlar
        genel_kont = pd.to_numeric(row.iloc[4], errors='coerce')
        genel_kont = int(genel_kont) if pd.notna(genel_kont) else 0
        
        okul_birincisi = pd.to_numeric(row.iloc[5], errors='coerce') if len(row) > 5 else 0
        okul_birincisi = int(okul_birincisi) if pd.notna(okul_birincisi) else 0

        meb_kont = pd.to_numeric(row.iloc[6], errors='coerce') if len(row) > 6 else 0
        meb_kont = int(meb_kont) if pd.notna(meb_kont) else 0

        tot_kont = genel_kont + okul_birincisi + meb_kont

        rank_val = None
        score_val = None
        if rank_col is not None and rank_col < len(row):
            rv = pd.to_numeric(row.iloc[rank_col], errors='coerce')
            if pd.notna(rv) and rv > 0:
                rank_val = int(rv)

        if score_col is not None and score_col < len(row):
            sv = pd.to_numeric(row.iloc[score_col], errors='coerce')
            if pd.notna(sv) and sv > 0:
                score_val = float(sv)

        city = detect_city(uni_name)
        uni_type = detect_uni_type(uni_name)

        university_obj, _ = University.objects.get_or_create(
            name=uni_name,
            defaults={'city': city, 'uni_type': uni_type}
        )

        degree = "Önlisans (2 Yıl)" if duration <= 2 else "Lisans (4+ Yıl)"
        clean_name = clean_dept_name(prog_name)

        program_obj, _ = Program.objects.get_or_create(
            code=prog_code,
            defaults={
                'name': prog_name,
                'clean_name': clean_name,
                'university': university_obj,
                'degree': degree,
                'score_type': puan_turu,
                'duration': duration
            }
        )

        rec_obj, created = QuotaRecord.objects.update_or_create(
            program=program_obj,
            year=year,
            defaults={
                'general_quota': genel_kont,
                'top_school_quota': okul_birincisi,
                'meb_quota': meb_kont,
                'total_quota': tot_kont,
                'is_closed': False,
                'is_new': False
            }
        )

        if rank_val or score_val:
            prev_rec, _ = QuotaRecord.objects.get_or_create(
                program=program_obj,
                year=prev_year,
                defaults={'total_quota': tot_kont}
            )
            if rank_val:
                prev_rec.min_ranking = rank_val
            if score_val:
                prev_rec.min_score = score_val
            prev_rec.save()

        if created:
            records_created += 1
        else:
            records_updated += 1

    return records_created, records_updated
