@echo off
echo Killing any processes on port 5001...

FOR /f "tokens=5" %%a IN ('netstat -ano ^| findstr :5001') DO (
    echo Found process %%a on port 5001
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting backend server...
npm run dev
