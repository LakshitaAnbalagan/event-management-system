const mongoose = require('mongoose');
const { spawn } = require('child_process');

async function startupCheck() {
  console.log('🚀 Event Management System - Startup Check\n');

  // Check 1: MongoDB Connection
  console.log('1. 🔍 Checking MongoDB connection...');
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('   ✅ MongoDB is running and accessible');
    await mongoose.connection.close();
  } catch (error) {
    console.error('   ❌ MongoDB connection failed:', error.message);
    console.error('   💡 Please start MongoDB first');
    return false;
  }

  // Check 2: Port availability
  console.log('\n2. 🔍 Checking port 5000 availability...');
  const net = require('net');
  const server = net.createServer();
  
  try {
    await new Promise((resolve, reject) => {
      server.listen(5000, () => {
        server.close();
        resolve();
      });
      server.on('error', reject);
    });
    console.log('   ✅ Port 5000 is available');
  } catch (error) {
    console.error('   ❌ Port 5000 is already in use');
    console.error('   💡 Please stop any other services using port 5000');
    return false;
  }

  // Check 3: Environment variables
  console.log('\n3. 🔍 Checking environment configuration...');
  const requiredEnvVars = ['NODE_ENV', 'PORT', 'MONGODB_URI'];
  let envOk = true;
  
  // Set defaults if not present
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PORT = process.env.PORT || '5000';
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kongu-event-management';
  
  console.log('   ✅ Environment variables configured:');
  console.log(`      NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`      PORT: ${process.env.PORT}`);
  console.log(`      MONGODB_URI: ${process.env.MONGODB_URI}`);

  return true;
}

async function startServer() {
  const checksPass = await startupCheck();
  
  if (!checksPass) {
    console.error('\n❌ Startup checks failed. Please fix the issues above before starting the server.');
    process.exit(1);
  }

  console.log('\n✅ All checks passed! Starting server...\n');
  console.log('=' .repeat(50));
  
  // Start the actual server
  const serverProcess = spawn('node', ['src/server.js'], {
    stdio: 'inherit',
    env: process.env
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGINT');
  });
}

startServer();
