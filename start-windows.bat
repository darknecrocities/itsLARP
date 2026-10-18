@echo off
setlocal enabledelayedexpansion
title itsLARP - Automated Windows Workforce Launcher
echo ========================================================
echo   itsLARP - AI Job-Hunting Workforce (Windows Setup)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Python environment for Backend Engine...
set "PYCMD="
where py >nul 2>nul && set "PYCMD=py -3"
if not defined PYCMD (
    where python >nul 2>nul && set "PYCMD=python"
)
if not defined PYCMD (
    echo [ERROR] Python not found. Please install Python from https://python.org or Microsoft Store.
    pause
    exit /b 1
)

if not exist "apps\api\.venv\Scripts\python.exe" (
    echo [2/4] Initializing Python Virtual Environment ^(apps\api\.venv^)...
    %PYCMD% -m venv "apps\api\.venv"
    echo Installing backend dependencies...
    "apps\api\.venv\Scripts\pip.exe" install -r "apps\api\requirements.txt"
) else (
    echo [2/4] Python virtualenv verified.
)

if not exist "apps\web\node_modules" (
    echo [3/4] Installing Web dependencies in apps\web...
    cd apps\web && call npm install && cd ..\..
) else (
    echo [3/4] Web dependencies verified.
)

echo [4/4] Launching itsLARP Services and Workspace...
echo.
echo Launching local background services at localhost:8000 and localhost:3000...
start "itsLARP Backend & Web" /min node scripts/dev.js

timeout /t 3 /nobreak >nul

if exist "%LOCALAPPDATA%\Programs\itslarp-desktop\itsLARP.exe" (
    echo Opening itsLARP Standalone Desktop...
    start "" "%LOCALAPPDATA%\Programs\itslarp-desktop\itsLARP.exe"
) else (
    echo Opening default browser at http://localhost:3000/dashboard...
    start "" "http://localhost:3000/dashboard"
)

echo.
echo ========================================================
echo   itsLARP Workforce is active and ready to use!
echo ========================================================
exit /b 0
