@echo off
title Deploy to Vercel
color 0B

echo ============================================
echo   Annapurneshwari Garments - Vercel Deploy
echo ============================================
echo.

cd /d "%~dp0"

echo Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing now...
    npm install -g vercel
    echo.
)

echo.
echo Deploying to Vercel (production)...
echo (You may be asked to log in the first time)
echo.
vercel --prod --yes

echo.
if %ERRORLEVEL% == 0 (
    echo ============================================
    echo   SUCCESS! Site is now LIVE on Vercel!
    echo ============================================
) else (
    echo ============================================
    echo   Deploy failed. Make sure Node.js is
    echo   installed: https://nodejs.org
    echo ============================================
)

pause
