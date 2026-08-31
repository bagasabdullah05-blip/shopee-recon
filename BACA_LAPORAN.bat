@echo off
chcp 65001 >nul
echo ========================================
echo  BACA LAPORAN SHOPEE - 100% OFFLINE
echo  Aman, tanpa API, tanpa upload
echo ========================================
echo.
echo Letakkan file Income Shopee (.xlsx) di folder ini,
echo lalu drag-drop file ke batch ini ATAU tekan Enter untuk pilih otomatis.
echo.
if not "%~1"=="" (
  set "INPUT=%~1"
  goto :proses
)
echo Mencari file Income*.xlsx di folder data...
for %%f in (data\Income*.xlsx) do set "INPUT=%%f"
if not defined INPUT (
  for %%f in (Income*.xlsx) do set "INPUT=%%f"
)
if not defined INPUT (
  echo Tidak ditemukan. Silakan drag file ke BACA_LAPORAN.bat
  pause
  exit /b
)
:proses
echo File sumber: %INPUT%
echo.
node src\build-clean-excel.js "%INPUT%"
echo.
echo ========================================
echo Selesai! Cek folder output/
echo ========================================
pause
