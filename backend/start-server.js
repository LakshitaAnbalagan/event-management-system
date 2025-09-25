const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Event Management System Backend Server...\n');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '5000';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kongu-event-management';

console.log('📋 Configuration:');
console.log(`   Environment: ${process.env.NODE_ENV}`);
console.log(`   Port: ${process.env.PORT}`);
console.log(`   MongoDB URI: ${process.env.MONGODB_URI}`);
console.log('');

// Start the server
const serverPath = path.join(__dirname, 'src', 'server.js');
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`\n🛑 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});
