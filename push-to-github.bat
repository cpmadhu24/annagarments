@echo off
title Push Annapurneshwari Garments to GitHub
color 0A

echo ============================================
echo   Annapurneshwari Garments - GitHub Push
echo ============================================
echo.

cd /d "%~dp0"

<<<<<<< HEAD
echo [1/6] Updating remote URL to annagarments repo...
=======
echo [1/5] Updating remote URL to annagarments repo...
>>>>>>> d903832a7cc85277750bb7bf1025895f04d75df6
git remote set-url origin https://github.com/cpmadhu24/annagarments.git
echo Done.
echo.

<<<<<<< HEAD
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
=======
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
>>>>>>> d903832a7cc85277750bb7bf1025895f04d75df6
echo (You may be prompted for your GitHub username and password/token)
echo.
git push origin main
echo.

if %ERRORLEVEL% == 0 (
    echo ============================================
<<<<<<< HEAD
    echo   SUCCESS! Site pushed to GitHub.
=======
    echo   SUCCESS! Code pushed to GitHub.
>>>>>>> d903832a7cc85277750bb7bf1025895f04d75df6
    echo   Visit: https://github.com/cpmadhu24/annagarments
    echo ============================================
    start https://github.com/cpmadhu24/annagarments
) else (
    echo ============================================
<<<<<<< HEAD
    echo   Still failing? Try force push below.
    echo   Running force push now...
    echo ============================================
    git push origin main --force
    if %ERRORLEVEL% == 0 (
        echo Force push successful!
        start https://github.com/cpmadhu24/annagarments
    )
=======
    echo   Push failed. See error above.
    echo   Make sure Git is installed and you are
    echo   logged in to GitHub.
    echo ============================================
>>>>>>> d903832a7cc85277750bb7bf1025895f04d75df6
)

echo.
pause
