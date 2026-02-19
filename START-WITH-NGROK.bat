@echo off
echo ========================================
echo Drone Defense System - Internet Access
echo ========================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ngrok not found!
    echo.
    echo Please install ngrok:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Extract ngrok.exe to this folder
    echo 3. Run: ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)

echo Starting server...
start "Drone Defense Server" cmd /k "node server.js"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting ngrok tunnel...
echo.
echo ========================================
echo COPY THE HTTPS URL BELOW:
echo ========================================
echo.

ngrok http 3000

pause
