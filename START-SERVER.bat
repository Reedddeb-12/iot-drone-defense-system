@echo off
echo ========================================
echo  Drone Defense System - Backend Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    echo.
)

REM Check if server.js exists
if not exist "server.js" (
    echo ERROR: server.js not found!
    echo Make sure you're in the correct directory.
    pause
    exit /b 1
)

echo Starting backend server...
echo.
echo IMPORTANT: Keep this window open!
echo The server must be running to send alerts.
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

pause
