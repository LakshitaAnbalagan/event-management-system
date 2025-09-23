@echo off
echo ====================================
echo Kongu Event Management System Setup
echo ====================================

echo.
echo Installing dependencies...

echo Installing root dependencies...
call npm install

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo ====================================
echo Setup Complete!
echo ====================================

echo.
echo Next Steps:
echo 1. Make sure MongoDB is running on your system
echo 2. Update backend/.env with your configuration
echo 3. Run 'npm run dev' to start both frontend and backend

echo.
echo MongoDB Installation Instructions:
echo 1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
echo 2. Install and start MongoDB service
echo 3. Or use MongoDB Atlas cloud service (update .env accordingly)

pause
