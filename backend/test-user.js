const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // Test minimal user creation
    const user = new User({
      name: 'Test Student',
      email: 'test@kongu.edu',
      password: 'password123'
    });

    console.log('User object before save:', user);
    
    await user.save();
    console.log('✅ User created successfully:', user._id);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testUser();
