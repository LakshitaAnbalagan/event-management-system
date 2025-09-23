# Kongu Event Management System

A full-stack event management system built for Kongu Engineering College using the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### 🎯 Core Features
- **Event Management**: Create, edit, and manage college events
- **Student Registration**: Easy registration process for students
- **Payment Integration**: QR code based payment system
- **Admin Dashboard**: Comprehensive admin panel for event oversight
- **Real-time Updates**: Live updates using Socket.IO
- **Responsive Design**: Mobile-friendly interface

### 👥 User Roles
- **Students**: Register for events, view event details, track registration status
- **Admins**: Create events, manage registrations, review payments

### 🚀 Technical Features
- JWT Authentication
- File upload with Cloudinary integration
- Email notifications
- Export functionality (Excel/PDF)
- QR code generation
- Rate limiting and security middleware

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- React Query
- Framer Motion
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO
- Cloudinary
- Nodemailer

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kongu-event-management-system
```

### 2. Run Setup Script
**Windows:**
```cmd
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your configuration:

```bash
cd backend
cp .env.example .env
```

Update the `.env` file with your settings:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/kongu_event_management
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Start the Application

From the root directory:

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run backend    # Starts backend on port 5000
npm run frontend   # Starts frontend on port 3000
```

## Manual Installation

If you prefer to install dependencies manually:

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development mode
- `npm run backend` - Start only the backend server
- `npm run frontend` - Start only the frontend server
- `npm run install-all` - Install dependencies for all parts
- `npm run build` - Build the frontend for production

### Backend Scripts
- `npm run dev` - Start backend in development mode with nodemon
- `npm start` - Start backend in production mode
- `npm run lint` - Run ESLint

### Frontend Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
kongu-event-management-system/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── store/           # State management (Zustand)
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── utils/           # Utility functions
│   └── package.json
├── package.json             # Root package.json
└── README.md
```

## MongoDB Setup

### Option 1: Local MongoDB Installation

1. **Download and Install MongoDB**
   - Windows: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Ubuntu: `sudo apt-get install mongodb`

2. **Start MongoDB Service**
   - Windows: MongoDB should start automatically as a service
   - macOS: `brew services start mongodb-community`
   - Ubuntu: `sudo systemctl start mongod`

3. **Verify Installation**
   ```bash
   mongosh # or mongo for older versions
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Set up database access (username/password)
4. Configure network access (add your IP)
5. Get your connection string and update the `MONGODB_URI` in `.env`

## Troubleshooting

### Common Issues

1. **Frontend Build Errors**
   - Ensure you have a `package.json` file in the root directory
   - Run `npm install` in the root directory

2. **MongoDB Connection Issues**
   - Make sure MongoDB is running locally, or
   - Check your Atlas connection string and network access
   - Verify your IP is whitelisted in MongoDB Atlas

3. **Port Already in Use**
   - Backend (5000): Change `PORT` in backend/.env
   - Frontend (3000): The dev server will automatically find another port

4. **Deprecation Warnings**
   - These are fixed in the latest version
   - Make sure you have the updated files

### Error Messages

- **"Unexpected end of file in JSON"**: Fixed by adding root package.json
- **"MongoDB connection error"**: Check MongoDB installation and connection string
- **Duplicate schema index warnings**: Fixed by removing duplicate indexes

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Made with ❤️ for Kongu Engineering College**
