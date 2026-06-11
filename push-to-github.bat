@echo off
title Push to GitHub
color 0A

cd /d "%~dp0"

echo Removing lock file if present...
if exist ".git\index.lock" del /f ".git\index.lock"

echo Setting remote to annagarments...
git remote set-url origin https://github.com/cpmadhu24/annagarments.git

echo Staging all files...
git add -A

echo Committing...
git commit -m "Website with images and multi-language support"

echo Force pushing to GitHub...
git push origin main --force

if %ERRORLEVEL% == 0 (
    echo.
    echo SUCCESS! Visit: https://github.com/cpmadhu24/annagarments
    start https://github.com/cpmadhu24/annagarments
) else (
    echo.
    echo FAILED - check error above.
)

pause
