@echo off
REM ============================================================
REM  Live site ka Next.js cache purge karo.
REM  Admin me content edit karne ke turant baad chalao.
REM
REM  Usage:  purge-cache.cmd                 (specialization)
REM          purge-cache.cmd course          (koi aur tag)
REM
REM  Allowed tags: specialization, course, universities,
REM                scholarship, blog, seo, institute-types,
REM                page-contents
REM ============================================================
setlocal
set TAG=%1
if "%TAG%"=="" set TAG=specialization

for /f "tokens=1,* delims==" %%a in ('findstr /b "FRONTEND_API_KEY=" "%~dp0.env"') do set KEY=%%b
set KEY=%KEY:"=%

echo Purging tag: %TAG% ...
curl -s -X POST "https://www.educationmalaysia.in/api/v1/revalidate" -H "X-API-KEY: %KEY%" -H "Content-Type: application/json" -d "{\"tag\":\"%TAG%\"}"
echo.
endlocal
