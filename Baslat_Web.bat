@echo off
title YÖK Veri Analitiği Web Platformu - Başlatıcı
echo ============================================================
echo   YÖK KONTENJAN ANALİTİĞİ VE TAHMİN PLATFORMU - WEB (v3.0)
echo ============================================================
echo.
echo [1/2] Django REST Backend Başlatılıyor (http://localhost:8000)...
start "Django Backend Server" cmd /k "cd /d %~dp0backend && python manage.py runserver 8000"

echo [2/2] React Frontend Sunucusu Başlatılıyor (http://localhost:3000)...
start "React Web Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ✅ Sistem başlatıldı! Tarayıcınızda http://localhost:3000 adresini açabilirsiniz.
echo.
timeout /t 3 >nul
start http://localhost:3000
