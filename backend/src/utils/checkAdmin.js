const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kongu-event-management');
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@kongu.edu' });
    
    if (adminUser) {
      console.log('✅ Admin user found!');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('🔐 Role:', adminUser.role);
      console.log('✅ Active:', adminUser.isActive);
      console.log('🆔 ID:', adminUser._id);
      console.log('📅 Created:', adminUser.createdAt);
      
      // Test password comparison
      const isPasswordValid = await adminUser.comparePassword('admin123456');
      console.log('🔑 Password test:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
      
    } else {
      console.log('❌ Admin user not found!');
      console.log('Creating admin user...');
      
      // Create admin user if not found
      const newAdmin = new User({
        name: 'System Administrator',
        email: 'admin@kongu.edu',
        password: 'admin123456',
        phone: '9876543210',
        college: 'Kongu Engineering College',
        department: 'Administration',
        city: 'Perundurai',
        role: 'admin',
        isActive: true
      });

      await newAdmin.save();
      console.log('✅ Admin user created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

checkAdminUser();
