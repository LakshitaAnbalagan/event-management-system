#!/bin/bash

echo "===================================="
echo "Kongu Event Management System Setup"
echo "===================================="

echo ""
echo "Installing dependencies..."

echo "Installing root dependencies..."
npm install

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "===================================="
echo "Setup Complete!"
echo "===================================="

echo ""
echo "Next Steps:"
echo "1. Make sure MongoDB is running on your system"
echo "2. Update backend/.env with your configuration"
echo "3. Run 'npm run dev' to start both frontend and backend"

echo ""
echo "MongoDB Installation Instructions:"
echo "1. Install MongoDB using package manager:"
echo "   - Ubuntu: sudo apt-get install mongodb"
echo "   - macOS: brew install mongodb-community"
echo "2. Start MongoDB service"
echo "3. Or use MongoDB Atlas cloud service (update .env accordingly)"
