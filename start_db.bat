@echo off
chcp 65001 >nul
title Aureon Local PostgreSQL Server (Port 5433)
color 0A

echo =================================================================
echo   Aureon PostgreSQL Database Server (Port 5433)
echo   [কোনো Administrator পাসওয়ার্ড লাগবে না - সরাসরি ডাবল ক্লিক করুন]
echo =================================================================
echo.
echo   * Host: localhost
echo   * Port: 5433
echo   * User: postgres
echo   * Password: (কোনো পাসওয়ার্ড লাগবে না, খালি থাকবে)
echo.
echo =================================================================
echo   ডাটাবেস চালু হচ্ছে... কাজ করার সময় এই উইন্ডোটি মিনিমাইজ করে রাখুন।
echo =================================================================
echo.

"C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "%~dp0.pgdata"
pause

