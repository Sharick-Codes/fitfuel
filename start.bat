@echo off
title FitFuel Launcher
echo ====================================================
echo         FITFUEL PRO - LAUNCHING APPLICATION
echo ====================================================
echo Starting FitFuel Backend Server (Port 5000)...
start "FitFuel Server" cmd /k "cd /d %~dp0server && npm start"

echo Starting FitFuel Frontend Client (Port 5173)...
start "FitFuel Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Application initialized!
echo Frontend (Dev): http://localhost:5173
echo Full-Stack (Unified): http://localhost:5000
echo Demo Credentials: demo@fitfuel.com / password123
echo ====================================================

