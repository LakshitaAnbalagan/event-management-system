const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@kongu.edu' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@kongu.edu');
      console.log('🔑 Password: admin123');
      mongoose.connection.close();
      return;
    }

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@kongu.edu',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@kongu.edu');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
