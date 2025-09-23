@echo off
echo Starting Frontend Development Server...
echo.

cd /d D:\kongu\event-management-system\frontend

echo Clearing any cached configs...
rmdir /s /q node_modules\.vite 2>nul

echo Starting Vite...
npx vite --config ./vite.config.js --force

pause
