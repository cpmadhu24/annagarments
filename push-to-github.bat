@echo off
title Push Annapurneshwari Garments to GitHub
color 0A

echo ============================================
echo   Annapurneshwari Garments - GitHub Push
echo ============================================
echo.

cd /d "%~dp0"

echo [1/6] Updating remote URL to annagarments repo...
git remote set-url origin https://github.com/cpmadhu24/annagarments.git
echo Done.
echo.

echo [2/6] Removing stale lock file if present...
if exist ".git\index.lock" (
    del /f ".git\index.lock"
    echo Lock file removed.
) else (
    echo No lock file found.
)
echo.

echo [3/6] Staging all files including Images folder...
git add -A
echo Done.
echo.

echo [4/6] Committing changes...
git commit -m "Add multi-language support and Images folder"
echo.

echo [5/6] Pulling remote changes first (to sync)...
git pull origin main --allow-unrelated-histories --no-edit
echo.

echo [6/6] Pushing to GitHub...
echo (You may be prompted for your GitHub username and password/token)
echo.
git push origin main
echo.

if %ERRORLEVEL% == 0 (
    echo ============================================
    echo   SUCCESS! Site pushed to GitHub.
    echo   Visit: https://github.com/cpmadhu24/annagarments
    echo ============================================
    start https://github.com/cpmadhu24/annagarments
) else (
    echo ============================================
    echo   Still failing? Try force push below.
    echo   Running force push now...
    echo ============================================
    git push origin main --force
    if %ERRORLEVEL% == 0 (
        echo Force push successful!
        start https://github.com/cpmadhu24/annagarments
    )
)

echo.
pause
