const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kongu-event-management');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@kongu.edu' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@kongu.edu',
      password: 'admin123456', // This will be hashed automatically by the pre-save hook
      phone: '9876543210',
      college: 'Kongu Engineering College',
      department: 'Administration',
      city: 'Perundurai',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@kongu.edu');
    console.log('🔐 Password: admin123456');
    console.log('👤 Role: admin');
    console.log('');
    console.log('You can now login to the admin panel using these credentials.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the script
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;
