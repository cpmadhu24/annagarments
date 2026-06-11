@echo off
title Push Annapurneshwari Garments to GitHub
color 0A

echo ============================================
echo   Annapurneshwari Garments - GitHub Push
echo ============================================
echo.

cd /d "%~dp0"

echo [1/5] Updating remote URL to annagarments repo...
git remote set-url origin https://github.com/cpmadhu24/annagarments.git
echo Done.
echo.

echo [2/5] Checking git status...
git status
echo.

echo [3/5] Staging all files...
git add .
echo Done.
echo.

echo [4/5] Committing changes...
git commit -m "Add multi-language support: English, Hindi, Kannada, Tamil, Telugu, Malayalam"
echo.

echo [5/5] Pushing to GitHub...
echo (You may be prompted for your GitHub username and password/token)
echo.
git push origin main
echo.

if %ERRORLEVEL% == 0 (
    echo ============================================
    echo   SUCCESS! Code pushed to GitHub.
    echo   Visit: https://github.com/cpmadhu24/annagarments
    echo ============================================
    start https://github.com/cpmadhu24/annagarments
) else (
    echo ============================================
    echo   Push failed. See error above.
    echo   Make sure Git is installed and you are
    echo   logged in to GitHub.
    echo ============================================
)

echo.
pause
