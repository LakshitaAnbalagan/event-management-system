@echo off
echo ====================================
echo Starting Frontend Without Config
echo ====================================

cd /d D:\kongu\event-management-system\frontend

echo Cleaning cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite

echo Starting Vite with minimal config...
npx vite serve --port 3000 --host --force --no-deps --config-file false

pause
