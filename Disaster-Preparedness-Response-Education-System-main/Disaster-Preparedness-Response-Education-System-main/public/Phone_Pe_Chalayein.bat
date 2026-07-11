@echo off
color 0A
title DPRES Mobile Server
echo ==========================================
echo Starting DPRES Server for Mobile Phone...
echo ==========================================
echo.

REM Find Local IPv4 Address
for /f "tokens=14" %%i in ('ipconfig ^| findstr /i "IPv4"') do set IP=%%i

echo ========================================================
echo Kripya apne Mobile Browser (Chrome) mein ye Link kholen:
echo.
echo      http://%IP%:8080
echo.
echo ========================================================
echo.
echo Yeh server abhi chal raha hai... (Is black window ko BAAKI KAAM KE LIYE band na karein)
echo.

REM Try npx first
npx http-server ./ -p 8080 -c-1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Node.js nahi mila... Python se try kar raha hu...
    python -m http.server 8080
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Aapke computer mein Node.js ya Python install nahi mila.
        echo Koi baat nahi! Sabse aasan tarika ye hai ki apne VS Code ke theek niche 'Go Live' button par click karein aur wahan aane wala IP mobile pe kholen.
        pause
    )
)
pause
