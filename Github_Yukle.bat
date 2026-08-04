@echo off
chcp 65001 > nul
echo ========================================================
echo   YÖK VERİ PLATFORMU - GİTHUB YÜKLEME ARACI
echo ========================================================
echo.
echo Proje GitHub deposuna yukleniyor...
echo.

"%~dp0git_tools\cmd\git.exe" push -u origin main

echo.
echo ========================================================
echo Islem tamamlandi!
echo ========================================================
pause
