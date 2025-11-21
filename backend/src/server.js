const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/students');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://127.0.0.1:51796",
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/localhost:\d+$/
    ],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://127.0.0.1:51796",
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /^http:\/\/localhost:\d+$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} from ${req.get('origin') || 'unknown'}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
const path = require('path');
const uploadsPath = path.join(__dirname, '../uploads');
console.log('📁 Serving static files from:', uploadsPath);

// Add middleware to log static file requests
app.use('/uploads', (req, res, next) => {
  console.log(`📸 Static file request: ${req.path}`);
  next();
});

app.use('/uploads', express.static(uploadsPath));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI 
  || process.env.MONGO_URL 
  || process.env.DATABASE_URL 
  || 'mongodb://localhost:27017/kongu-event-management';

if (!process.env.MONGODB_URI && !process.env.MONGO_URL && !process.env.DATABASE_URL) {
  console.warn('⚠️  No MongoDB URI provided via env vars. Falling back to localhost; this will fail on hosted environments.');
}

mongoose.connect(mongoUri)
.then(() => {
  console.log('Connected to MongoDB using URI:', mongoUri.replace(/\/\/.*@/, '//****:****@'));
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Make io instance available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Kongu Event Management API Server is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events', 
      admin: '/api/admin',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Kongu Event Management Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room based on user type
  socket.on('join-room', (data) => {
    const { userType, userId } = data;
    socket.join(`${userType}-${userId}`);
    socket.join(userType); // Join general user type room
    console.log(`User ${userId} joined ${userType} room`);
  });

  // Handle real-time event updates
  socket.on('event-updated', (eventData) => {
    socket.broadcast.emit('event-updated', eventData);
  });

  // Handle real-time registration updates
  socket.on('registration-updated', (registrationData) => {
    socket.broadcast.emit('registration-updated', registrationData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };
