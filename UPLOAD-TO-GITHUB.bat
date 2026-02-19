@echo off
echo ========================================
echo  GitHub Upload Script
echo  IoT Drone Defense System
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo Git version:
git --version
echo.

REM Check if already initialized
if exist ".git" (
    echo Git repository already initialized.
    echo.
) else (
    echo Initializing Git repository...
    git init
    echo.
)

REM Configure Git (if not configured)
echo Checking Git configuration...
git config user.name >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Git is not configured. Let's set it up!
    echo.
    set /p USERNAME="Enter your name: "
    set /p EMAIL="Enter your email: "
    git config --global user.name "%USERNAME%"
    git config --global user.email "%EMAIL%"
    echo.
    echo Git configured successfully!
    echo.
)

echo Current Git configuration:
git config user.name
git config user.email
echo.

REM Get repository URL
echo ========================================
echo  GitHub Repository Setup
echo ========================================
echo.
echo Before continuing, create a repository on GitHub:
echo 1. Go to https://github.com/new
echo 2. Repository name: iot-drone-defense-system
echo 3. Description: IoT Drone Defense System with AI detection
echo 4. Choose Public or Private
echo 5. DO NOT initialize with README
echo 6. Click "Create repository"
echo.
echo After creating, copy the repository URL
echo Example: https://github.com/YOUR_USERNAME/iot-drone-defense-system.git
echo.

set /p REPO_URL="Paste your repository URL here: "

if "%REPO_URL%"=="" (
    echo ERROR: Repository URL cannot be empty!
    pause
    exit /b 1
)

echo.
echo Repository URL: %REPO_URL%
echo.

REM Add remote
echo Checking remote repository...
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Remote 'origin' already exists. Updating...
    git remote set-url origin %REPO_URL%
) else (
    echo Adding remote repository...
    git remote add origin %REPO_URL%
)
echo.

REM Add all files
echo Adding files to Git...
git add .
echo.

REM Show status
echo Current status:
git status
echo.

REM Commit
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Initial commit: Complete IoT Drone Defense System
)

echo.
echo Committing files...
git commit -m "%COMMIT_MSG%"
echo.

REM Check if main or master branch
git branch -M main
echo.

REM Push to GitHub
echo ========================================
echo  Pushing to GitHub
echo ========================================
echo.
echo You may be prompted for credentials:
echo - Username: Your GitHub username
echo - Password: Use Personal Access Token (NOT your password)
echo.
echo To create a Personal Access Token:
echo 1. Go to GitHub Settings
echo 2. Developer settings
echo 3. Personal access tokens
echo 4. Generate new token (classic)
echo 5. Select 'repo' scope
echo 6. Copy the token and use it as password
echo.
pause
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUCCESS!
    echo ========================================
    echo.
    echo Your project has been uploaded to GitHub!
    echo.
    echo Repository URL: %REPO_URL%
    echo.
    echo Next steps:
    echo 1. Visit your repository on GitHub
    echo 2. Add description and topics
    echo 3. Star your repository
    echo 4. Share with others!
    echo.
) else (
    echo.
    echo ========================================
    echo  UPLOAD FAILED
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Wrong credentials - Use Personal Access Token
    echo 2. Repository doesn't exist - Create it on GitHub first
    echo 3. Network issues - Check your internet connection
    echo.
    echo See GITHUB-UPLOAD-GUIDE.md for detailed help
    echo.
)

pause
